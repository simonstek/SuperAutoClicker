#pragma once
#include <Windows.h>
#include <iostream>
#include <string>
#include <sstream>

using namespace std;

//��stringת����wstring  
wstring string2wstring(string str);
//��wstringת����string  
string wstring2string(wstring wstr);
string num2str(double n);