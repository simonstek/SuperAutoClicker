#include "MacroFile.h"

#include "LogUtil.h"
#include <QString>
#include <QDir>
#include <QFile>
#include <QDataStream>
#include <QUuid>
#include <QJsonDocument>
#include <QJsonObject>

#include "Constants.h"

MacroFile::MacroFile(QObject* parent/* = Q_NULLPTR*/)
	: QObject(parent)
	, version(1)
	, duration(0)
	, hotkeyVkCode(0)
{
}

MacroFile::~MacroFile()
{
}


bool MacroFile::serialize(QString path)
{
	QByteArray ba;
	QDataStream os(&ba, QIODevice::WriteOnly);
	os << gMacroFileMagic;
	os << version;
	os << QString::fromStdWString(id);
	os << createdTime;
	os << QString::fromStdWString(name);
	os << duration;
	os << hotkeyVkCode;
	os << events.size();
	for (auto i = 0; i < events.size(); i++)
	{
		const auto& e = events.at(i);
		os << e.type;
		os << e.time;
		os << e.msg;
		os << e.wParam;
		os << e.lParam;
		os << e.scanCode;
		os << e.vkCode;
		os << e.x;
		os << e.y;
		os << e.mouseData;
		os << e.flags;
	}

	QFile df(path);
	if (!df.open(QIODevice::WriteOnly))
	{
		LOG_INFO("[{:>24}] serialize macro file: {} failed. unabled to open", "MacroFile", path.toStdString());
		return false;
	}
	df.write(qCompress(ba));
	df.flush();
	df.close();

	return true;
}

bool MacroFile::deserialize(QString path)
{
	QFile df(path);

	if (!df.exists()) {
		LOG_INFO("[{:>24}] deserialize macro file : {} failed. no such file", "MacroFile", path.toStdString());
		return false;
	}

	if (!df.open(QIODevice::ReadOnly))
	{
		LOG_INFO("[{:>24}] deserialize macro file : {} failed. unabled to open", "MacroFile", path.toStdString());
		return false;
	}

	auto ba = qUncompress(df.readAll());
	QDataStream os(&ba, QIODevice::ReadOnly);
	df.close();

	QString magic;
	os >> magic;
	if (magic != gMacroFileMagic)
	{
		LOG_INFO("[{:>24}] deserialize macro file : {} failed. wrong magic: {}", "MacroFile", path.toStdString(), magic.toStdString());
		return false;
	}

	os >> version;

	QString tid;
	os >> tid;
	id = tid.toStdWString();

	os >> createdTime;

	QString tname;
	os >> tname;
	name = tname.toStdWString();

	os >> duration;
	os >> hotkeyVkCode;

	size_t size;
	os >> size;
	for (auto i = 0; i < size; i++)
	{
		InputEvent e;

		qint32 type;
		os >> type;
		e.type = (eInputType)type;

		os >> e.time;
		os >> e.msg;
		os >> e.wParam;
		os >> e.lParam;
		os >> e.scanCode;
		os >> e.vkCode;
		os >> e.x;
		os >> e.y;
		os >> e.mouseData;
		os >> e.flags;

		events.push_back(e);
	}

	return true;
}

sciter::value MacroFile::get_events()
{
	sciter::value es;
	
	for (auto i = 0; i < events.size(); i++)
	{
		es.append(events.at(i).wrap());
	}

	return es;
}