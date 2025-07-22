import { useCallback, useEffect, useMemo, useState } from "react";
import { InputField } from "./InputField";

import { Expense as ExpenseInterface } from "../../redux/slices/expensesSlice";

type NewExpense = Omit<ExpenseInterface, "_id" | "status">;

interface ExpenseData {
  description: string;
  amount: number | string;
  category: string;
  date: string;
}

interface ExpenseFormProps {
  onSubmit: (data: NewExpense | ExpenseInterface) => void;
  initialData?: Partial<ExpenseInterface> | NewExpense;
  onCancel?: () => void;
}

export default function ExpenseForm({
  onSubmit,
  initialData,
  onCancel,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState<string | number>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const today = new Date().toISOString().slice(0, 10);

  const resetForm = useCallback(() => {
    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
    setFormError("");
  }, []);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || "");
      setCategory(initialData.category || "");
      setDate(initialData.date ? initialData.date.substr(0, 10) : "");
      setDescription(initialData.description || "");
    } else {
      resetForm();
    }
  }, [initialData, resetForm]);

  const inputHandlers: Record<
    keyof ExpenseData,
    React.Dispatch<React.SetStateAction<string | number | any>>
  > = {
    amount: setAmount,
    category: setCategory,
    date: setDate,
    description: setDescription,
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "amount") {
        inputHandlers[name as keyof ExpenseData](Number(value));
      } else {
        inputHandlers[name as keyof ExpenseData](value);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormError("");

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setFormError("Amount must be a number greater than 0.");
        return;
      }

      if (!category) {
        setFormError("Category is required.");
        return;
      }

      if (!date) {
        setFormError("Date is required.");
        return;
      }

      onSubmit({
        amount: Number(amount),
        category,
        date,
        description,
      });

      if (!initialData) resetForm();
    },
    [amount, category, date, description, onSubmit, initialData, resetForm]
  );

  const isUpdateDisabled = useMemo(() => {
    if (!initialData) return false;
    return (
      amount === initialData.amount &&
      category === initialData.category &&
      date === (initialData.date ? initialData.date.substr(0, 10) : "") &&
      description === (initialData.description || "")
    );
  }, [amount, category, date, description, initialData]);

  return (
    <form
      className="bg-white rounded shadow mb-6 p-2 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-end"
      onSubmit={handleSubmit}
    >
      <InputField
        label="Amount"
        type="number"
        name="amount"
        value={amount}
        onChange={handleInputChange}
        className="w-full sm:w-32"
      />
      <InputField
        label="Category"
        type="text"
        name="category"
        value={category}
        onChange={handleInputChange}
        placeholder="e.g., Food, Travel"
        className="w-full sm:w-44"
      />
      <InputField
        label="Date"
        type="date"
        name="date"
        value={date}
        onChange={handleInputChange}
        max={today}
        className="w-full sm:w-40"
      />
      <InputField
        label="Description"
        type="text"
        name="description"
        value={description}
        onChange={handleInputChange}
        placeholder="Optional"
        className="flex-1 min-w-0"
      />

      <div className="flex gap-2 pt-2 sm:pt-0 w-full sm:w-auto">
        <button
          type="submit"
          className={`px-4 py-2 h-10 rounded font-semibold w-full sm:w-auto ${
            initialData
              ? isUpdateDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          }`}
          disabled={initialData && isUpdateDisabled}
        >
          {initialData ? "Update" : "Add"}
        </button>

        {initialData && onCancel && (
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 h-10 rounded font-semibold hover:bg-gray-400 cursor-pointer w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>

      {formError && (
        <div className="w-full text-red-600 mt-1 text-sm">{formError}</div>
      )}
    </form>
  );
}
