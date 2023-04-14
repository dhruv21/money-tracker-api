const validationMessage = {
  // phone number
  phoneNumberRequired: "Phone number is required",
  inValidPhoneNumberFormat: "Phone number format is invalid",

  // phone number
  panNumberRequired: "PAN number is required",
  inValidPanNumberFormat: "PAN number format is invalid",

  // password
  passwordRequired: "Password is required",
  passwordMaxLength: "Password must be less then 200 characters",
  passwordMinLength: "Password must be greater then 5 characters",

  // account
  accountRequired: "Account detail is required",
  accountMaxLength: "Account detail must be less then 50 characters",
  accountMinLength: "Account detail must be greater then 4 characters",

  // owner
  ownerRequired: "Owner name detail is required",
  ownerMaxLength: "Owner name detail must be less then 20 characters",
  ownerMinLength: "Owner name detail must be greater then 2 characters",

  // bank
  bankRequired: "Bank detail is required",
  bankMaxLength: "Bank detail must be less then 20 characters",
  bankMinLength: "Bank detail must be greater then 2 characters",

   // income
   incomeRequired: "Income name is required",
   incomeMaxLength: "Income name must be less then 50 characters",
   incomeMinLength: "Income name must be greater then 4 characters",
 
   // expenses
   expensesRequired: "Expenses name is required",
   expensesMaxLength: "Expenses name must be less then 50 characters",
   expensesMinLength: "Expenses name must be greater then 4 characters",
 
   // investment
   investmentRequired: "Investment name is required",
   investmentMaxLength: "Investment name must be less then 50 characters",
   investmentMinLength: "Investment name must be greater then 4 characters",

   // planned transaction
   amountRequired: "Amount is required",
   amountMaxLength: "Amount must be less then 100000000",
   amountMinLength: "Amount must be greater then 0",

   // transaction period
   transactionPeriodRequired: "Transaction period is required",

   // description
   descriptionMaxLength: "Description name must be less then 50 characters",
   descriptionMinLength: "Description name must be greater then 4 characters",
};

module.exports = validationMessage;
