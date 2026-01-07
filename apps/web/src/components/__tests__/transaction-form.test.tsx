import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "../transaction-form";

describe("TransactionForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe("Initial State", () => {
    it("renders with empty fields by default", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      const senderNameInput = screen.getByLabelText(
        /sender name/i
      ) as HTMLInputElement;
      const cardIdInput = screen.getByLabelText(/card id/i) as HTMLInputElement;

      expect(amountInput.value).toBe("");
      expect(senderNameInput.value).toBe("");
      expect(cardIdInput.value).toBe("");
    });

    it("has no preset tab selected by default", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      const safeTrigger = screen.getByRole("tab", { name: /safe/i });
      const sanctionsTrigger = screen.getByRole("tab", {
        name: /sanctions hit/i,
      });
      const riskyTrigger = screen.getByRole("tab", { name: /high risk/i });

      expect(safeTrigger).toHaveAttribute("data-state", "inactive");
      expect(sanctionsTrigger).toHaveAttribute("data-state", "inactive");
      expect(riskyTrigger).toHaveAttribute("data-state", "inactive");
    });

    it("renders the Clear button", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      expect(
        screen.getByRole("button", { name: /clear/i })
      ).toBeInTheDocument();
    });

    it("renders the Analyze transaction button", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      expect(
        screen.getByRole("button", { name: /analyze transaction/i })
      ).toBeInTheDocument();
    });
  });

  describe("Preset Tabs", () => {
    it("fills form with Safe preset values when Safe tab is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      const safeTrigger = screen.getByRole("tab", { name: /safe/i });
      await user.click(safeTrigger);

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      const senderNameInput = screen.getByLabelText(
        /sender name/i
      ) as HTMLInputElement;
      const cardIdInput = screen.getByLabelText(/card id/i) as HTMLInputElement;

      expect(amountInput.value).toBe("45.5");
      expect(senderNameInput.value).toBe("Sarah Smith");
      expect(cardIdInput.value).toBe("card_valid_999");
      expect(safeTrigger).toHaveAttribute("data-state", "active");
    });

    it("fills form with Sanctions preset values when Sanctions tab is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      const sanctionsTrigger = screen.getByRole("tab", {
        name: /sanctions hit/i,
      });
      await user.click(sanctionsTrigger);

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      const senderNameInput = screen.getByLabelText(
        /sender name/i
      ) as HTMLInputElement;
      const cardIdInput = screen.getByLabelText(/card id/i) as HTMLInputElement;

      expect(amountInput.value).toBe("1200");
      expect(senderNameInput.value).toBe("AEROCARIBBEAN AIRLINES");
      expect(cardIdInput.value).toBe("card_reg_99");
      expect(sanctionsTrigger).toHaveAttribute("data-state", "active");
    });

    it("fills form with High Risk preset values when High Risk tab is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      const riskyTrigger = screen.getByRole("tab", { name: /high risk/i });
      await user.click(riskyTrigger);

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      const senderNameInput = screen.getByLabelText(
        /sender name/i
      ) as HTMLInputElement;
      const cardIdInput = screen.getByLabelText(/card id/i) as HTMLInputElement;

      expect(amountInput.value).toBe("9500");
      expect(senderNameInput.value).toBe("Suspicious user");
      expect(cardIdInput.value).toBe("card_risk_007");
      expect(riskyTrigger).toHaveAttribute("data-state", "active");
    });
  });

  describe("Clear Button", () => {
    it("clears form fields when Clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      // First fill the form with a preset
      const safeTrigger = screen.getByRole("tab", { name: /safe/i });
      await user.click(safeTrigger);

      // Verify form is filled
      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      expect(amountInput.value).toBe("45.5");

      // Click clear button
      const clearButton = screen.getByRole("button", { name: /clear/i });
      await user.click(clearButton);

      // Verify form is cleared
      expect(amountInput.value).toBe("");
      expect(
        (screen.getByLabelText(/sender name/i) as HTMLInputElement).value
      ).toBe("");
      expect(
        (screen.getByLabelText(/card id/i) as HTMLInputElement).value
      ).toBe("");
    });

    it("deselects preset tab when Clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      // Select a preset
      const safeTrigger = screen.getByRole("tab", { name: /safe/i });
      await user.click(safeTrigger);
      expect(safeTrigger).toHaveAttribute("data-state", "active");

      // Click clear button
      const clearButton = screen.getByRole("button", { name: /clear/i });
      await user.click(clearButton);

      // Verify no tab is selected
      expect(safeTrigger).toHaveAttribute("data-state", "inactive");
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with form data when submitted", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      // Fill form manually
      await user.type(screen.getByLabelText(/amount/i), "100.50");
      await user.type(screen.getByLabelText(/sender name/i), "John Doe");
      await user.type(screen.getByLabelText(/card id/i), "card_test_123");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /analyze transaction/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.TransactionAmt).toBe(100.5);
      expect(submittedData.sender_name).toBe("John Doe");
      expect(submittedData.card_id).toBe("card_test_123");
      expect(submittedData.transaction_id).toMatch(/^txn_\d+$/);
    });

    it("shows Analyzing... text when isLoading is true", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
    });

    it("disables Clear button when isLoading is true", () => {
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("shows validation error when submitting with empty required fields", async () => {
      const user = userEvent.setup();
      render(<TransactionForm onSubmit={mockOnSubmit} isLoading={false} />);

      // Try to submit empty form
      const submitButton = screen.getByRole("button", {
        name: /analyze transaction/i,
      });
      await user.click(submitButton);

      // onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
