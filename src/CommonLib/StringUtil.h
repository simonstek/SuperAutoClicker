#pragma once
#include <Windows.h>
#include <iostream>
#include <string>
#include <sstream>

using namespace std;

//将string转换成wstring  
wstring string2wstring(string str);
//将wstring转换成string  
string wstring2string(wstring wstr);
string num2str(double n);