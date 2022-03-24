const puppeteer = require('puppeteer');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();


const args = process.argv.slice(2);
const buttonType = args ? args[0] : null;

const getCurrentDate = () => {
  const today = new Date();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return `${dd}.${mm}.${today.getFullYear()} ${today.toLocaleTimeString('ru-RU')}`;
}

const writeLogs = (status, stop, err) => {
  const logMessage = `${getCurrentDate()} | Status: ${status ? "Success" : "Error"} ${err} ${stop ? '\n\n' : '\n'}`
  fs.appendFileSync('logs/log.txt', logMessage);

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_USER_ID) {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: false});
    bot.sendMessage(process.env.TELEGRAM_USER_ID, logMessage);
  }
  return true;
}

if (!process.env.BX_USERNAME || !process.env.BX_PASSWORD) {
  console.log('Не указан логин или пароль')
  return false;
}

if (!buttonType) {
  writeLogs(false, 'start', `Не передан аргумент`);
  console.log('Передайте аргумент: "start" | "stop"')
  return false;
}

(async () => {
  try {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 800});

    await page.goto('https://tkvprok.bitrix24.ru/', {waitUntil: 'networkidle2'});

    await page.waitForSelector('input[type="text"]')
    await page.type('input[type="text"]', process.env.BX_USERNAME)
    console.log('Ввели логин');
    await page.waitFor(1000);

    await page.click('.ui-btn-success')

    await page.waitForSelector('input[type="password"]')
    await page.type('input[type="password"]', process.env.BX_PASSWORD)
    console.log('Ввели пароль');
    await page.waitFor(2000);

    await page.keyboard.press('Enter')

    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle2'})
    ]);

    await page.waitFor('#timeman-background')
    await page.click('#timeman-background')
    console.log('Кликнули открыть окно');

    await page.waitFor(1000);

    if (buttonType === 'start') {
      await page.click('.ui-btn-icon-start')
    } else {
      await page.click('.ui-btn-icon-stop')
    }
    console.log('Задание выполнено');

    writeLogs(true, buttonType !== 'start', '')

    await browser.close()
  } catch (e) {
    writeLogs(false, buttonType !== 'start', `| ${e.message}`)
    throw e.message;
  }
})()
