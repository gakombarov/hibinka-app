from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from collections import defaultdict
from datetime import datetime, timedelta
from django.core.paginator import Paginator

from apps.trips.models import Trip
from apps.trips.serializer import TripSerializer
from apps.expenses.models import Expense
from apps.expenses.serializer import ExpenseSerializer


class DashboardView(APIView):
    """
    Дашборд: журнал по дням
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not self._is_admin(request.user):
            return self._forbidden_response()

        date_range = self._parse_date_range(request)
        if isinstance(date_range, Response):  
            return date_range

        start_date, end_date = date_range

        trips = self._get_trips(start_date, end_date)
        expenses = self._get_expenses(start_date, end_date)

        trips_by_date = self._group_by_date(trips, 'trip_date', TripSerializer)
        expenses_by_date = self._group_by_date(expenses, 'expense_date', ExpenseSerializer)

        days_list = self._build_days_list(trips_by_date, expenses_by_date)

        page_data = self._paginate_days(request, days_list)

        return Response({
            'count': page_data['count'],
            'next': page_data['next'],
            'previous': page_data['previous'],
            'results': page_data['results'],
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'start_formatted': start_date.strftime('%d.%m.%Y'),
                'end_formatted': end_date.strftime('%d.%m.%Y'),
            }
        })

    def _is_admin(self, user):
        """Проверка что пользователь — администратор"""
        return user.account_type == 'ADMIN'

    def _forbidden_response(self):
        """Ответ при отсутствии прав доступа"""
        return Response(
            {'error': 'Доступ только для администраторов'},
            status=status.HTTP_403_FORBIDDEN
        )

    def _parse_date_range(self, request):
        """
        Парсинг параметров фильтра дат.
        Возвращает (start_date, end_date) или Response с ошибкой.
        """
        days = int(request.query_params.get('days', 30))
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if date_from and date_to:
            try:
                start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Неверный формат даты. Используйте YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)

        return start_date, end_date

    def _get_trips(self, start_date, end_date):
        """Запрос поездок за период"""
        return Trip.objects.select_related(
            'customer', 'vehicle', 'driver', 'driver__user'
        ).prefetch_related('stops').filter(
            trip_date__gte=start_date,
            trip_date__lte=end_date,
            is_deleted=False
        )

    def _get_expenses(self, start_date, end_date):
        """Запрос расходов за период"""
        return Expense.objects.filter(
            expense_date__gte=start_date,
            expense_date__lte=end_date,
            is_deleted=False
        )

    def _group_by_date(self, queryset, date_field, serializer_class):
        """
        Группировка QuerySet по дате.
        
        Args:
            queryset: QuerySet для группировки
            date_field: название поля с датой ('trip_date' или 'expense_date')
            serializer_class: сериализатор для объектов
        
        Returns:
            dict: {date_str: [serialized_objects]}
        """
        grouped = defaultdict(list)
        for obj in queryset:
            date_key = getattr(obj, date_field).isoformat()
            grouped[date_key].append(serializer_class(obj).data)
        return grouped

    def _build_days_list(self, trips_by_date, expenses_by_date):
        """
        Формирование списка дней с поездками, расходами и статистикой.
        
        Returns:
            list: список словарей с данными по каждому дню
        """
        days_list = []
        all_dates = sorted(
            set(trips_by_date.keys()) | set(expenses_by_date.keys()),
            reverse=True
        )

        for date_str in all_dates:
            date_obj = datetime.fromisoformat(date_str).date()
            trips_for_date = trips_by_date.get(date_str, [])
            expenses_for_date = expenses_by_date.get(date_str, [])

            days_list.append({
                'date': date_str,
                'day_of_week': self._get_russian_day(date_obj.weekday()),
                'formatted_date': date_obj.strftime('%d.%m.%Y'),
                'trips': trips_for_date,
                'expenses': expenses_for_date,
                'statistics': self._calculate_day_statistics(trips_for_date, expenses_for_date)
            })

        return days_list

    def _calculate_day_statistics(self, trips, expenses):
        """
        Подсчёт статистики за один день.
        
        Args:
            trips: список сериализованных поездок
            expenses: список сериализованных расходов
        
        Returns:
            dict: статистика за день
        """
        total_income = sum(t['cost'] for t in trips)
        total_expenses = sum(float(e['amount']) for e in expenses)

        completed_count = len([t for t in trips if t['status'] == 'COMPLETED'])
        paid_count = len([t for t in trips if t['payment_status'] == 'PAID'])
        in_progress_count = len([t for t in trips if t['status'] == 'IN_PROGRESS'])
        planned_count = len([t for t in trips if t['status'] == 'PLANNED'])

        return {
            'total_trips': len(trips),
            'completed_trips': completed_count,
            'in_progress_trips': in_progress_count,
            'planned_trips': planned_count,
            'paid_trips': paid_count,
            'unpaid_trips': len(trips) - paid_count,
            'total_income': round(total_income, 2),
            'total_expenses': round(total_expenses, 2),
            'profit': round(total_income - total_expenses, 2),
        }

    def _paginate_days(self, request, days_list):
        """
        Пагинация списка дней.
        
        Returns:
            dict: {'count', 'next', 'previous', 'results'}
        """
        page_size = int(request.query_params.get('page_size', 5))
        paginator = Paginator(days_list, page_size)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)

        return {
            'count': paginator.count,
            'next': self._build_page_link(request, page_obj.next_page_number()) if page_obj.has_next() else None,
            'previous': self._build_page_link(request, page_obj.previous_page_number()) if page_obj.has_previous() else None,
            'results': list(page_obj.object_list),
        }

    def _build_page_link(self, request, page_number):
        """Построение ссылки на страницу пагинации"""
        params = request.GET.copy()
        params['page'] = page_number
        return f'{request.path}?{params.urlencode()}'

    def _get_russian_day(self, weekday):
        """Получение русского названия дня недели"""
        days = {
            0: 'Понедельник',
            1: 'Вторник',
            2: 'Среда',
            3: 'Четверг',
            4: 'Пятница',
            5: 'Суббота',
            6: 'Воскресенье',
        }
        return days.get(weekday, '')