import os
import time

from datetime import datetime

while True:
    thetime = str(datetime.now())


    hey = thetime.split(' ')[1]
    hey1 = hey.split('.')[0]

    hournum =int(hey1.split(':')[0])
    hournum -= 1


    if hournum > 12 and hournum <24:
        ampm = "pm"
        hournum -= 12
    elif hournum == 12:
        ampm = "pm"
        hournum = 12
    elif hournum == 24:
        hournum -=12
        ampm="am"
    else:
        ampm="am"

    minutenum=int(hey1.split(':')[1])

    timestr = f"{hournum}:{minutenum} {ampm}"
    cmd = f"figlet \"{timestr}\" | lolcat"


    os.system('cls')
    os.system(cmd)
    time.sleep(2)
