const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// #region global variables
let TOTALOVERS = 0;
let CURRENTOVER = 0;
let CURRENTBALL = 0;
let SCORE = 0;
let SCOREDETAIL = [];

bot.start((ctx) => {
  ctx.replyWithMarkdown(
    `🏏 *Welcome to Cricket Run Count Bot!* 🏏\n\nLet's start scoring your match! 🕹️\n` +
      `How many overs will the match have? (e.g., *5*)`
  );
});

bot.on("text", (ctx) => {
  const text = ctx.message.text;

  //#region Check if it's the start of the match
  if (!TOTALOVERS) {
    TOTALOVERS = parseInt(text);
    if (isNaN(TOTALOVERS) || TOTALOVERS <= 0) {
      ctx.replyWithMarkdown(
        `⚠️ *Invalid input!* Please enter a valid number of overs (e.g., *3* or *5*).`
      );
      return;
    }
    CURRENTOVER = 1;
    CURRENTBALL = 1;
    SCOREDETAIL.push([]);
    ctx.replyWithMarkdown(
      `🎉 *Match set for ${TOTALOVERS} overs!* 🎉\n\n👉 Here comes the *first ball*! Use the buttons below to record the result:`,
      createRunKeyboard()
    );
  } else {
    //#region Handle scoring
    let run = 0;
    let ballSummary = "";

    switch (text) {
      case "Wide Ball":
        run = 1;
        ballSummary = `🎯 *Ball ${CURRENTBALL}: Wide Ball* (+1 run)`;
        break;
      case "No Ball":
        run = 1;
        ballSummary = `🚫 *Ball ${CURRENTBALL}: No Ball* (+1 run)`;
        break;
      case "1 Run":
        run = 1;
        ballSummary = `⚡ *Ball ${CURRENTBALL}: 1 Run*`;
        CURRENTBALL++;
        break;
      case "2 Runs":
        run = 2;
        ballSummary = `⚡ *Ball ${CURRENTBALL}: 2 Runs*`;
        CURRENTBALL++;
        break;
      case "3 Runs":
        run = 3;
        ballSummary = `⚡ *Ball ${CURRENTBALL}: 3 Runs*`;
        CURRENTBALL++;
        break;
      case "4 Runs":
        run = 4;
        ballSummary = `🏏 *Ball ${CURRENTBALL}: 4 Runs (Boundary!)*`;
        CURRENTBALL++;
        break;
      case "6 Runs":
        run = 6;
        ballSummary = `🎆 *Ball ${CURRENTBALL}: 6 Runs (SIXER!)*`;
        CURRENTBALL++;
        break;
      case "0 Run":
        ballSummary = `⚪ *Ball ${CURRENTBALL}: Dot Ball (No Run)*`;
        CURRENTBALL++;
        break;
      case "Dead Ball":
        ballSummary = `💤 *Ball ${CURRENTBALL}: Dead Ball (No Count)*`;
        break;
      default:
        ctx.replyWithMarkdown(
          "❌ *Invalid input!* Please use the buttons to enter valid runs or extras."
        );
        return;
    }

    SCORE += run;
    SCOREDETAIL[CURRENTOVER - 1].push(ballSummary);

    //#region Check if over is complete
    if (CURRENTBALL > 6) {
      CURRENTOVER++;
      CURRENTBALL = 1;

      //#region Over summary
      const overSummary = SCOREDETAIL[CURRENTOVER - 2].join("\n");
      ctx.replyWithMarkdown(
        `✅ *End of Over ${
          CURRENTOVER - 1
        }*\n\n📋 *Over Summary:*\n${overSummary}\n\n` +
          `🔢 *Total SCORE:* ${SCORE}`
      );

      if (CURRENTOVER > TOTALOVERS) {
        //#region  Match end
        ctx.replyWithMarkdown(
          `🏁 *Match Ended!* 🎉\n\n` +
            `📊 *Final SCORE:* ${SCORE}\n\n` +
            `🕹️ Use /start to begin a new match.`
        );
        resetGame();
        return;
      } else {
        SCOREDETAIL.push([]);
      }
    }

    ctx.replyWithMarkdown(
      `👉 *Over ${CURRENTOVER}, Ball ${CURRENTBALL}:*\n\n🔢 *Total SCORE:* ${SCORE}`,
      createRunKeyboard()
    );
  }
});

//#region Helper function to create the run keyboard
function createRunKeyboard() {
  return Markup.keyboard([
    ["1 Run", "2 Runs", "3 Runs"],
    ["4 Runs", "6 Runs"],
    ["Wide Ball", "No Ball", "Dead Ball"],
    ["0 Run"],
  ])
    .oneTime()
    .resize();
}

// Helper function to reset the game
function resetGame() {
  TOTALOVERS = 0;
  CURRENTOVER = 0;
  CURRENTBALL = 0;
  SCORE = 0;
  SCOREDETAIL = [];
}

bot.launch();
console.log("Cricket Run Count Bot is running!");
