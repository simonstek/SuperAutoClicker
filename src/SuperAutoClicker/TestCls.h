#pragma once

#include "sciter-x.h"
#include "sciter-x-window.hpp"

class TestCls : public sciter::value
{
public:
	TestCls(const sciter::value& other);
	
	template<typename T>
	sciter::value _cdecl setter(T const&);

	template<>
	sciter::value _cdecl setter<TestCls>(TestCls const&);
};
