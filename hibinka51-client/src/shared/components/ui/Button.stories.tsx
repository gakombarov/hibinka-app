import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "UI-Kit/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["contained", "outlined", "text"],
      description: "Внешний вид кнопки",
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "info",
        "success",
        "warning",
        "inherit",
      ],
    },
    size: {
      control: "radio",
      options: ["small", "medium", "large"],
    },
    isLoading: {
      control: "boolean",
      description: "Показать спиннер загрузки",
    },
    rounded: {
      control: "boolean",
      description: "Сделать кнопку полностью круглой по краям",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Основная кнопка",
    variant: "contained",
    color: "primary",
    size: "medium",
    isLoading: false,
    rounded: false,
  },
};

export const Loading: Story = {
  args: {
    children: "Отправка данных...",
    variant: "contained",
    color: "primary",
    size: "large",
    isLoading: true,
  },
};

export const Rounded: Story = {
  args: {
    children: "Оформить заявку",
    variant: "contained",
    color: "primary",
    rounded: true,
  },
};

export const Outlined: Story = {
  args: {
    children: "Отмена",
    variant: "outlined",
    color: "inherit",
  },
};
