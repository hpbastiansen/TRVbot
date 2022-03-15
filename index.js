require("dotenv").config();

const schedule = require("node-schedule");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

const garbage = [
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 3,
    day: 27,
  },
  {
    type: "Papir",
    person: "143138160673685504",
    month: 4,
    day: 3,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 4,
    day: 10,
  },
  {
    type: "Plast",
    person: "144138923403247616",
    month: 4,
    day: 17,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 4,
    day: 24,
  },
  {
    type: "Papir",
    person: "176393515855511552",
    month: 5,
    day: 1,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 5,
    day: 8,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 5,
    day: 22,
  },
  {
    type: "Papir",
    person: "176393515855511552",
    month: 5,
    day: 29,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 6,
    day: 5,
  },
  {
    type: "Plast",
    person: "143138160673685504",
    month: 6,
    day: 12,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 6,
    day: 19,
  },
  {
    type: "Papir",
    person: "144138923403247616",
    month: 6,
    day: 26,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 7,
    day: 3,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 7,
    day: 17,
  },
  {
    type: "Papir",
    person: "144138923403247616",
    month: 7,
    day: 24,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 7,
    day: 31,
  },
  {
    type: "Plast",
    person: "176393515855511552",
    month: 8,
    day: 7,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 8,
    day: 14,
  },
  {
    type: "Papir",
    person: "143138160673685504",
    month: 8,
    day: 21,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 8,
    day: 28,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 9,
    day: 11,
  },
  {
    type: "Papir",
    person: "143138160673685504",
    month: 9,
    day: 18,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 9,
    day: 25,
  },
  {
    type: "Plast",
    person: "144138923403247616",
    month: 10,
    day: 2,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 10,
    day: 9,
  },
  {
    type: "Papir",
    person: "176393515855511552",
    month: 10,
    day: 16,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 10,
    day: 23,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 11,
    day: 6,
  },
  {
    type: "Papir",
    person: "176393515855511552",
    month: 11,
    day: 13,
  },
  {
    type: "Restavfall",
    person: "144138923403247616",
    month: 11,
    day: 20,
  },
  {
    type: "Plast",
    person: "143138160673685504",
    month: 11,
    day: 27,
  },
  {
    type: "Restavfall",
    person: "176393515855511552",
    month: 12,
    day: 4,
  },
  {
    type: "Papir",
    person: "144138923403247616",
    month: 12,
    day: 11,
  },
  {
    type: "Restavfall",
    person: "143138160673685504",
    month: 12,
    day: 18,
  },
];

let tasks = [];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  switch (msg.content) {
    case "!subscribe":
      if (!isSubscribed(msg.author.id)) {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const hour = date.getHours();

        const items = garbage.filter(
          (item) =>
            item.person === msg.author.id &&
            (item.month > month ||
              (item.month === month && item.day > day) ||
              (item.day === day && hour < 20))
        );
        setTasks(msg, items);
        msg.reply("Subscribed.");
      } else {
        msg.reply("You are already subscribed.");
      }
      break;

    case "!unsubscribe":
      if (isSubscribed(msg.author.id)) {
        cancelTasks(msg.author.id);
        msg.reply("Unsubscribed!");
      } else {
        msg.reply("You are not subscribed.");
      }
      break;
    case "!tasks":
      console.log(tasks);
      break;
  }
});

function setTasks(msg, items) {
  items.forEach((item) => {
    let task = schedule.scheduleJob(`0 20 ${item.day} ${item.month} *`, () => {
      msg.channel.send(`<@${item.person}> ${item.type}`);
    });
    tasks.push({
      person: item.person,
      task: task,
    });
  });
  console.log(`Tasks set for user ${msg.author.id}!`);
}

function cancelTasks(user) {
  const userTasks = tasks.filter((task) => task.person === user);
  userTasks.forEach((element) => element.task.cancel());
  tasks = tasks.filter((task) => task.person !== user);
  console.log(`Tasks cancelled for user ${user}!`);
}

function isSubscribed(user) {
  return tasks.filter((task) => task.person === user).length > 0;
}

client.login(process.env.CLIENT_TOKEN);
