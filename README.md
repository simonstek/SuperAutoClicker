# Super Auto Clicker

[Super Auto Clicker](https://superautoclicker.com/) is a free and powerful mouse auto clicker, your great assistant in game playing, online shopping, documents processing, and more. 



## Screenshot

![auto clicker - superautoclicker.com](https://superautoclicker.com/assets/img/hero/superautoclicker.com.png)



## Features

- Supports left, right, and middle mouse click. 
- Click interval can vary from 0.001s to 999mins.
- Infinite repeat or limited clicks.
- Auto click at specific point on the screen.
- Record your mouse and keyboard operations, then replay.
- Global hot key settings.



## Platform

Currently available only for Windows OS (Windows 7, 8, 10, or 11).



## Download

Download the latest version from the [releases](https://github.com/simonstek/SuperAutoClicker/releases) page, unzip and run SuperAutoClicker.exe.



## Build

### Environment Setup

1. Download and install [Visual Studio 2022](https://visualstudio.microsoft.com/vs/). Make sure you have selected "Desktop development with C++":

   ![image-20220512094230316](doc/readme/img/README/image-20220512094230316.png)

   

2. Download and install [Qt 5.6.2](https://download.qt.io/new_archive/qt/5.6/5.6.2/qt-opensource-windows-x86-msvc2015-5.6.2.exe)

   

3. Install `Qt Visual Studio Tools` in VS2022(Menu--Extensions--Manage Extensions--Online-Visual Studio Marketplace):

   ![image-20220512094410425](doc/readme/img/README/image-20220512094410425.png)

   ![image-20220512094450197](doc/readme/img/README/image-20220512094450197.png)

   

4. After installing Qt Visual Studio Tools, restart VS2022. Configure Qt version(Menu--Extensions--Qt VS Tools--Qt Versions):

   ![image-20220512094814600](doc/readme/img/README/image-20220512094814600.png)

   ![image-20220512094909092](doc/readme/img/README/image-20220512094909092.png)

   As seen above, the `Version` tag must be set to `Qt 5.6.2`. The `path` tag should be set to  `<your-Qt-5.6.2-installation-direcotry>\5.6\msvs2015`. Then click OK to finish Qt version setup.

   

5. Download and install [Python](https://www.python.org/downloads/). Python version must be >= 3.8. Make sure you have selected `Add Python to environment variables`:

   ![image-20220512095803143](doc/readme/img/README/image-20220512095803143.png)

   

   Open command prompt and type `python --version`. Then press Enter key.

   If your Python is installed correctly, you can see the Python version:

   ![image-20220512101238746](doc/readme/img/README/image-20220512101238746.png)

   

6. Setup unzip command. Add `<your-git-installation-directory>\usr\bin` to system environment variables:

   ![image-20220512102632446](doc/readme/img/README/image-20220512102632446.png)



Open command prompt and type `unzip` to check whether your git commands is correctly configured.

If everything is OK, you'll see the results like below:

![image-20220512102849081](doc/readme/img/README/image-20220512102849081.png)



### Project Setup

Open command prompt and `cd` to `your-super-auto-clicker-git-repository\cnf`:

![image-20220512100540179](doc/readme/img/README/image-20220512100540179.png)

 

Type `python configure_client.py` and wait for the configuration steps to finish:

![image-20220512103151041](doc/readme/img/README/image-20220512103151041.png)



If everything is OK, you'll see the results like below:

![image-20220512103407987](doc/readme/img/README/image-20220512103407987.png)





### Build Project

Open `SuperAutoClicker.sln` using VS2022. Rebuild entire solution and wait.

If everything is OK, you'll see the compilation result:

![image-20220512104011524](doc/readme/img/README/image-20220512104011524.png)

Set `SuperAutoClicker` as startup project. Start debugging. You'll see the software is finally shown up:



![image-20220512104300915](doc/readme/img/README/image-20220512104132663.png)



![image-20220512104300915](doc/readme/img/README/image-20220512104300915.png)
