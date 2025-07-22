interface ExpenseInput {
  amount: string | number | null | undefined;
  category?: string;
  date?: string;
}

function validateExpense(body: ExpenseInput): string[] {
  const errors: string[] = [];

  // Amount validation
  if (body.amount === undefined || body.amount === null || body.amount === "") {
    errors.push("Amount is required");
  } else if (isNaN(Number(body.amount))) {
    errors.push("Amount must be a number");
  } else if (Number(body.amount) <= 0) {
    errors.push("Amount must be greater than 0");
  }

  // Category validation
  if (!body.category || body.category.trim() === "") {
    errors.push("Category is required");
  }

  // Date validation
  if (!body.date || body.date.trim() === "") {
    errors.push("Date is required");
  }

  return errors;
}

export default validateExpense;
