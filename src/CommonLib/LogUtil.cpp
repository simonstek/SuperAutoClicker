#include "LogUtil.h"

#include "Constants.h"
#include "PathUtil.h"
#include <QDir>
#include <QCoreApplication>
#include <psapi.h>

std::shared_ptr<spdlog::logger> get_logger()
{
    QString gAppName = "SuperAutoClicker";
    auto name = gAppName.toStdString();

    auto logger = spdlog::get(name);
    if (nullptr == logger)
    {
        auto dir = QString("%1/%2").arg(PathUtil::getTempPath()).arg(gAppName);
        auto path = QString("%1/%2.log").arg(dir).arg(gAppName);

        WCHAR szPath[MAX_PATH] = { 0 };
        GetModuleBaseName(GetCurrentProcess(), NULL, szPath, sizeof(szPath));
        QString qProc = QString::fromStdWString(szPath);

        QDir d(dir);
        if (!d.exists())
        {
            d.mkdir(".");
        }

        spdlog::set_level(spdlog::level::trace);

        //logger = spdlog::rotating_logger_mt(name, path.toStdString(), 1024 * 1024 * 10, 10);
        logger = spdlog::daily_logger_format_mt(name, path.toStdString(), 0, 0, false, 30);
        logger->set_level(spdlog::level::trace);
        logger->set_pattern(QString("[%Y-%m-%d %H:%M:%S.%e %4oms][%1][P%6P][T%6t]%-300v [%@ %!]").arg(qProc).toStdString());
    }
    return logger;
}
