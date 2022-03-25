require("dotenv").config();

const fs = require("fs");
const schedule = require("node-schedule");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

const ADMIN_ID = process.env.ADMIN_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const CHANNEL_ID_TEST = process.env.CHANNEL_ID_TEST;

const TESTING = true;

let admin;
let channel;

const garbage = JSON.parse(fs.readFileSync("./garbage.json"));

let tasks = [];

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  admin = await client.users.fetch(ADMIN_ID).catch(() => null);
  channel = await client.channels
    .fetch(TESTING ? CHANNEL_ID_TEST : CHANNEL_ID)
    .catch(() => null);
  setSubscribersTasks();
});

client.on("messageCreate", (msg) => {
  switch (msg.content) {
    case "!subscribe":
      if (!isSubscribed(msg.author.id)) {
        addSubscriber(msg.author.id);
        msg.reply("Subscribed.");
      } else {
        msg.reply("You are already subscribed.");
      }
      break;

    case "!unsubscribe":
      if (isSubscribed(msg.author.id)) {
        cancelTasks(msg.author.id);
        removeSubscriber(msg.author.id);
        msg.reply("Unsubscribed!");
      } else {
        msg.reply("You are not subscribed.");
      }
      break;
    case "!next":
      const nextTask = getNextTask(msg.author.id);
      if (!isSubscribed(msg.author.id)) {
        msg.reply("You are not subscribed.");
      } else if (nextTask) {
        date = new Date(nextTask.time).toLocaleString("no");
        msg.reply(`Next task: "${nextTask.type}" at ${date}`);
      } else {
        msg.reply("No tasks registered.");
        admin.send(`No tasks registered for ${msg.author.id}`);
      }
      break;
  }
});

function addSubscriber(subscriber) {
  const subscribers = getSubscribers();
  subscribers.push(subscriber);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
  setSubscribersTasks();
}

function removeSubscriber(subscriber) {
  const subscribers = getSubscribers();
  const index = subscribers.indexOf(subscriber);
  subscribers.splice(index, 1);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
  setSubscribersTasks();
}

function getSubscribers() {
  return JSON.parse(fs.readFileSync("./subscribers.json"));
}

function setSubscribersTasks() {
  clearTasks();
  const subscribers = getSubscribers();

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hour = date.getHours();

  subscribers.forEach((subscriber) =>
    setTasks(
      subscriber,
      garbage.filter(
        (item) =>
          item.person === subscriber &&
          (item.month > month ||
            (item.month === month && item.day > day) ||
            (item.day === day && hour < 20))
      )
    )
  );
}

function getNextTask(person) {
  const personTasks = tasks.filter((task) => task.person === person);
  if (personTasks.length > 0) return personTasks[0];
  return null;
}

function setTasks(id, items) {
  items.forEach((item) => {
    let task = schedule.scheduleJob(`0 20 ${item.day} ${item.month} *`, () => {
      channel.send(`<@${item.person}> ${item.type}`);
    });

    const date = new Date(2022, item.month - 1, item.day, 20);

    tasks.push({
      task: task,
      person: item.person,
      type: item.type,
      time: date.getTime(),
    });
  });
  console.log(`Tasks set for user ${id}!`);
}

function cancelTasks(user) {
  const userTasks = tasks.filter((task) => task.person === user);
  userTasks.forEach((element) => element.task.cancel());
  tasks = tasks.filter((task) => task.person !== user);
  console.log(`Tasks cancelled for user ${user}!`);
}

function clearTasks() {
  tasks.forEach((element) => element.task.cancel());
  tasks = [];
  console.log(`Cleared all tasks.`);
}

function isSubscribed(user) {
  const subscribers = getSubscribers();
  return subscribers.includes(user);
}

client.login(process.env.CLIENT_TOKEN);
