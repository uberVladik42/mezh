"""
Функции Telegram-бота
"""
import os
import time
import random
import telebot

ow_quotes = ["*HELDEN STERBEN NICHT!* © _Mercy_", "*ET ZINGT VOOR MIJ!* © _Sigma_",
             "*APAGANDO LAS LUCES!* © _Sombra_", "*VAMOS ESCULACHA!* © _Lucio_",
             "*GÉILL DO MO THOIL!* © _Moira_", "*RYŪJIN NO KEN WO KURAE!* © _Genji_",
             "*DIE! DIE! DIE!* © _Reaper_", "*PERSONNE N'ÉCHAPPE À MON REGARD! * © _Widowmaker_",
             "*VIDE BAL SOU YO!* © _Baptiste_", "*YAHÍ PARAM VAASTAVIKTA HAI!* © _Symmetra_",
             "*ALLA TILL MIG!* © _Brigitte_", "*WARĪHUM QUWITIK!* © _Ana_",
             "*NERF THIS!* © _D.Va_", " *Dun dun boop boop-boop boop bwooooooooooom.* © _Bastion_",
             "*True self is without form.* © _Zenyatta_", "*DÒNG ZHÙ! BÙ XǓ ZǑU!* © _Mei_",
             "*RYŪ GA WAGA TEKI WO KURAU!* © _Hanzo_"
             ]

api_key = os.getenv("TG_API_KEY", "bruh")
bot = telebot.TeleBot(api_key)

WEBHOOK_HOST = os.getenv("CURRENT_HOST", 'mezh-dxd.ml')
WEBHOOK_PORT = 443
WEBHOOK_URL = f'https://{WEBHOOK_HOST}:{WEBHOOK_PORT}/telegram/'


def init():
    """
    Инициализатор Telegram
    """
    bot.delete_webhook()
    time.sleep(0.1)
    bot.set_webhook(WEBHOOK_URL)


@bot.message_handler(commands=['start'])
def start(message: telebot.types.Message):
    """
    Команда /start по-умолчанию.

    **bot.message_handler**

    :param message: Сообщение для обработки
    :type message: telebot.types.Message
    """
    bot.reply_to(message, random.choice(ow_quotes), parse_mode="markdown")


@bot.message_handler(commands=['add_class'])
def add_class(message: telebot.types.Message):
    """
    Функция, проверяющая вашу возможность изменять 'Klass' ссылки.

    **bot.message_handler**

    :param message: Сообщение для обработки
    :type message: telebot.types.Message
    """
    user = bot.get_chat_member(message.chat.id, message.from_user.id)
    if user.status in ["administrator", "creator"]:
        msg = bot.reply_to(message, "Введите класс (в формате 7 А):")
        bot.register_next_step_handler(msg, actual_class)
    else:
        bot.reply_to(message, "Недостаточно прав.")


def actual_class(message: telebot.types.Message) -> None:
    """
    Функция, изменяющая 'Klass' ссылку на данный чат.

    :param message: Сообщение для обработки
    :type message: telebot.types.Message
    :return: None в случае, если Класс Не Существует или Неверный Формат
    :rtype: None
    """
    from app.dnevnik.models import Klass
    try:
        chat_id = message.chat.id
        _class = message.text.split(" ")
        if len(_class) != 2:
            bot.reply_to(message, 'Формат ввода: "7 А".')
            return
        try:
            old = Klass.objects.get(tg_chat_id=chat_id)
            old.tg_chat_id = None
            old.tg_link = None
            old.save()
        except Klass.DoesNotExist:
            pass
        invite = bot.export_chat_invite_link(chat_id)
        klass = Klass.objects.get(genus_num=_class[0], genus_sym=_class[1])
        klass.tg_link = invite
        klass.tg_chat_id = chat_id
        klass.save()
        bot.reply_to(message, random.choice(ow_quotes), parse_mode="markdown")
    except Klass.DoesNotExist:
        bot.reply_to(message, "Данный класс отсутствует в базе данных")
