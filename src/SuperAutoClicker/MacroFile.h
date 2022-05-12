#pragma once
#include "InputEvent.h"
#include <string>
#include <vector>
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include <QObject>
#include <QPointer>
#include <QString>

class MacroFile : public QObject, public sciter::om::asset<MacroFile>
{
	Q_OBJECT

public:
	MacroFile(QObject* parent = Q_NULLPTR);
	~MacroFile();

	bool serialize(QString path);
	bool deserialize(QString path);

	sciter::value get_events();
	
	std::string magic;
	unsigned int version;
	sciter::string id;
	double createdTime;
	sciter::string name;
	double duration; // in milliseconds
	double hotkeyVkCode;
	std::vector<InputEvent> events;

	SOM_PASSPORT_BEGIN(MacroFile)
		SOM_PROPS(
			SOM_PROP(id),
			SOM_PROP(createdTime),
			SOM_PROP(name),
			SOM_PROP(duration),
			SOM_PROP(hotkeyVkCode),
			SOM_RO_VIRTUAL_PROP(events, get_events)
		)
	SOM_PASSPORT_END
};