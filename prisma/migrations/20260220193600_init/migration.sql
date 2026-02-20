-- CreateTable
CREATE TABLE "Calculation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loanAmount" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "loanPeriodYears" INTEGER NOT NULL,
    "monthlyPayment" REAL NOT NULL,
    "totalPaid" REAL NOT NULL,
    "totalInterest" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
