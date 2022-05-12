#pragma once

#ifndef SPDLOG_ACTIVE_LEVEL
#define SPDLOG_ACTIVE_LEVEL SPDLOG_LEVEL_TRACE
#endif // !SPDLOG_ACTIVE_LEVEL

#include <spdlog/spdlog.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include <spdlog/sinks/daily_file_sink.h>

std::shared_ptr<spdlog::logger> get_logger();

#define LOG_DEBUG(...) \
{ \
    SPDLOG_LOGGER_DEBUG(get_logger(), __VA_ARGS__); \
    spdlog::debug(__VA_ARGS__); \
}

#define LOG_INFO(...) \
{ \
    SPDLOG_LOGGER_INFO(get_logger(), __VA_ARGS__); \
}
