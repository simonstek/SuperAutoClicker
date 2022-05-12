#pragma once

#include <QtCore/qglobal.h>

#ifndef BUILD_STATIC
# if defined(COMMONLIB_LIB)
#  define COMMONLIB_EXPORT Q_DECL_EXPORT
# else
#  define COMMONLIB_EXPORT Q_DECL_IMPORT
# endif
#else
# define COMMONLIB_EXPORT
#endif
