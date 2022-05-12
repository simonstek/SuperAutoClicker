#include <Windows.h>
#include <QCoreApplication>
#include <QString>
#include <QDir>
#include <QProcess>
#include <iostream>
#include <string>
#include <LogUtil.h>

#pragma comment( linker, "/subsystem:\"windows\" /entry:\"mainCRTStartup\"" )

bool launch(QString exeFullPath, QString workDir, QString command);

int main(int argc, char *argv[])
{
    LOG_INFO("[{:>12}] PowerKit start!", "PowerKit");
    LOG_INFO("[{:>12}] argc: {}", "PowerKit", argc);
    for (int i = 0; i < argc; i++)
    {
        LOG_INFO("[{:>12}] argv[{}]={}", "PowerKit", i, argv[i]);
    }

    if (argc > 1)
    {
        std::string action = argv[1];
        LOG_INFO("[{:>12}] action: {}", "PowerKit", action);

        QString param = "";
        if (argc > 2)
        {
            std::string a2 = argv[2];
            LOG_INFO("[{:>12}] a2: {}", "PowerKit", a2);
            auto q = QString::fromStdString(a2).toUtf8();
            auto dec = QByteArray::fromBase64(q);
            auto ss = dec.toStdString();
            param = QString::fromStdString(ss);
            LOG_INFO("[{:>12}] decoded param: {}", "PowerKit", ss);
        }

        if (action == "remove_dir")
        {
            QDir d(param);

            int count = 0;
            while (true)
            {
                ::Sleep(1);
                count++;
                if (count > 2000) break;
            }
            bool ret = d.removeRecursively();

            LOG_INFO("[{:>12}] remove dir result: ", "PowerKit", ret);
        }
        else if (action == "open")
        {
            auto list = param.split(';');

            if (list.size() == 1)
            {
                launch(list[0], ".", "");
            } 
            else if (list.size() == 2) 
            {
                launch(list[0], list[1], "");
            }
            else if (list.size() == 3)
            {
                launch(list[0], list[1], list[2]);
            }
            else
            {
                LOG_INFO("[{:>12}] too long param list!", "PowerKit");
            }
        }
    }

    //system("pause");
}


bool launch(QString exeFullPath, QString workDir, QString command)
{
    LOG_INFO("[{:>12}] try to launch {}. workdir: {}. command: {}", "PowerKit", exeFullPath.toStdString(), workDir.toStdString(), command.toStdString());
    bool started = QProcess::startDetached(exeFullPath, command.split(','), workDir);
    LOG_INFO("[{:>12}] started: {}", "PowerKit", started);
    return started;
}