from rest_framework import serializers
from apps.expenses.models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id', 'expense_date', 'category',
            'responsible_person', 'amount',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        """Валидация суммы расхода"""
        if value <= 0:
            raise serializers.ValidationError(
                "Сумма расхода должна быть больше нуля"
            )
        return value