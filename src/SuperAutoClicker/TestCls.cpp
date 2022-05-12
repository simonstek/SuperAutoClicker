#include "TestCls.h"

TestCls::TestCls(const sciter::value& other)
{

}

template<typename T>
sciter::value _cdecl TestCls::setter(T const&)
{
	return 0;
}

template<>
sciter::value _cdecl TestCls::setter<TestCls>(TestCls const&)
{
	return 0;
}