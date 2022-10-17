import { prompt } from "inquirer";

// Exection of App
Main();

interface ITransactionList {
  type: "Withdraw" | "Deposit";
  amount: number;
  fees: number;
  closingBalance: number;
  date: string;
}

interface IUser {
  userId: string;
  pin: number;
}

type menuType = {
  selectedMenu:
    | "Withdraw"
    | "Deposit"
    | "Balance Inquiery"
    | "Statements"
    | "Change Pin"
    | "Logout";
};

async function Main() {
  let users: IUser[] = [
    {
      userId: "admin",
      pin: 1234,
    },
    {
      userId: "aasim",
      pin: 2244,
    },
  ];

  //
  let transactionList: ITransactionList[] = [
    {
      type: "Deposit",
      amount: 2000,
      fees: 0,
      closingBalance: 2000,
      date: "10/05/2022, 6:20:01 AM",
    },
    {
      type: "Withdraw",
      amount: 1000,
      fees: 1,
      closingBalance: 999,
      date: "10/15/2022, 2:20:01 AM",
    },
    {
      type: "Deposit",
      amount: 5000,
      fees: 0,
      closingBalance: 5999,
      date: "10/18/2022, 5:20:01 PM",
    },
  ];

  console.log(`Welcome to ATM. \n`);

  let userId: string = await Authorization(users);
  console.log(`\nHello ${userId}!\n`);

  const running: boolean = true;

  while (running) {
    const { selectedMenu } = (await prompt({
      name: "selectedMenu",
      message: "Menu",
      type: "list",
      choices: [
        "Withdraw",
        "Deposit",
        "Balance Inquiery",
        "Statements",
        "Change Pin",
        "Logout",
      ],
    })) as menuType;

    if (selectedMenu === "Logout") {
      console.log(`\nyou've Logged out from ATM\n`);
      userId = await Authorization(users);
    }

    (await selectedMenu) === "Withdraw"
      ? await transaction(transactionList, "Withdraw")
      : selectedMenu === "Deposit"
      ? await transaction(transactionList, "Deposit")
      : selectedMenu === "Balance Inquiery"
      ? console.log(
          `\n # Account Balance: ${transactionList.at(-1)?.closingBalance}\n`
        )
      : selectedMenu === "Statements"
      ? console.table(transactionList)
      : selectedMenu === "Change Pin"
      ? await changePin(users, userId)
      : null;
  }
}

async function Authorization(users: IUser[]): Promise<string> {
  try {
    let activeUserId: string;
    const { userId, pin } = await prompt([
      {
        name: "userId",
        message: "Enter UserId:",
        type: "input",
        validate: (input) => {
          if (
            !users.some(({ userId }) => userId === input.trim().toLowerCase())
          ) {
            return "Invalid UserID , please Re enter UserId after Prssing Backscape";
          }

          activeUserId = input;
          return true;
        },
      },
      {
        name: "pin",
        message: "Enter PIN (4 Digit):",
        type: "password",
        validate: (input) => {
          let message: string | boolean;
          if (isNaN(input) || String(input.trim()).length !== 4) {
            message =
              "Pin must be a 4 Digit Number! Please Re Enter PIN after Prssing Backscape";
          } else {
            users.forEach((user) => {
              if (activeUserId === user.userId) {
                if (input == user.pin) {
                  message = true;
                } else {
                  message =
                    "Invalid Pin! Please Re Enter PIN after Prssing Backscape";
                }
              }
            });
          }
          return message;
        },
      },
    ]);
    return activeUserId;
  } catch (err) {
    console.log(`Error: ${err}`);
    return "Error: " + err;
  }
}

async function transaction(
  transactionList: ITransactionList[],
  type: "Deposit" | "Withdraw"
): Promise<void> {
  const { amount } = await prompt({
    name: "amount",
    message: "Enter Amount to :",
    type: "input",
    validate: (input) => {
      if (isNaN(input)) {
        return "Invalid Value! Please Re Enter Amount after Prssing Backscape";
      }
      return true;
    },
  });
  const balance: number | undefined = transactionList.at(-1)?.closingBalance;

  if (balance !== undefined && type === "Withdraw") {
    if (Number(amount) > balance) console.log("\n# inSufficient balance !\n");
    else {
      transactionList.push({
        type: "Withdraw",
        amount: Number(amount),
        fees: Number(amount) > 1000 ? 1 : Number(amount) > 10000 ? 10 : 0,
        closingBalance: balance - Number(amount),
        date: new Date().toLocaleString(),
      });
      console.log(`\n# Withdrawl Transaction Succesfull\n`);
    }
  } else {
    transactionList.push({
      type: "Deposit",
      amount: Number(amount),
      fees: 0,
      closingBalance: balance + Number(amount),
      date: new Date().toLocaleString(),
    });
    console.log(`\n# Deposit Transaction Succesfull\n`);
  }
}

async function changePin(users: IUser[], userId: string): Promise<void> {
  const index: number = users.findIndex((user) => user.userId === userId);

  if (index !== -1) {
    const { pin } = await prompt([
      {
        name: "oldpin",
        message: "Enter Current PIN (4 Digit):",
        type: "password",
        validate: (input) => {
          let message: string | boolean;
          if (isNaN(input) || String(input.trim()).length !== 4) {
            message =
              "Pin must be a 4 Digit Number! Please Re Enter PIN after Prssing Backscape";
          } else {
            if (input == users[index].pin) {
              message = true;
            } else {
              message =
                "Invalid Pin! Please Re Enter PIN after Prssing Backscape";
            }
          }
          return message;
        },
      },
      {
        name: "pin",
        message: "Enter New PIN (4 Digit):",
        type: "password",
        validate: (input) => {
          let message: string | boolean = true;
          if (isNaN(input) || String(input.trim()).length !== 4) {
            message =
              "Pin must be a 4 Digit Number! Please Re Enter PIN after Prssing Backscape";
          }
          return message;
        },
      },
    ]);
    users[index] = { ...users[index], pin: pin };
    console.log(`\n# PIN updated Succesfully\n`);
  }
}
