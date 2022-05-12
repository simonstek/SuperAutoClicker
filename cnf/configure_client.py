# -*- coding: UTF-8 -*-
import os
import json
import re
import datetime
import urllib.request
import json
import hashlib
import requests

def start_configure():
    print('start to confiture client...')

    os.chdir('../')

    f = open('cnf/config.json', 'r')
    config = json.load(f)
    f.close()

    if not download_sdks():
        os.chdir('cnf')
        print('failed to download sdks')
        return

    if not extract_sdks():
        print('failed to extract sdks')
        os.chdir('cnf')
        return

    native_version = config['nativeVersion']
    ui_version = config['uiVersion']
    brand = config['brands']['superautoclicker.com']
    configure('superautoclicker.com', brand, native_version, ui_version)

    os.chdir('cnf')

    print('configure complete!')


def download_sdks():
    if not os.path.isdir('3rd'):
        print('3rd does not exist. create it')
        os.mkdir('3rd')

    os.chdir('3rd')    

    if not os.path.exists('sciter-js-sdk.zip'):
        print('download sciter sdk...')
        urllib.request.urlretrieve('https://revos.oss-cn-guangzhou.aliyuncs.com/sdk/sciter-js-sdk.zip', 'sciter-js-sdk.zip')
        print('download sciter sdk complete!')

    if not os.path.exists('spdlog-1.9.2.zip'):
        print('download spdlog sdk...')
        urllib.request.urlretrieve('https://revos.oss-cn-guangzhou.aliyuncs.com/sdk/spdlog-1.9.2.zip', 'spdlog-1.9.2.zip')
        print('download sciter sdk complete!')

    if not os.path.exists('Qt5Core.dll'):
        print('download Qt5Core.dll...')
        urllib.request.urlretrieve('https://revos.oss-cn-guangzhou.aliyuncs.com/sdk/Qt5Core.dll', 'Qt5Core.dll')
        print('download Qt5Core.dll complete!')

    os.chdir('../')

    return True


def extract_sdks():
    print('extracting sdks...')
    print('entering 3rd folder')
    os.chdir('3rd')

    condition = True
    while condition == True:
        # extracting sciter-js-sdk
        sciter_js_sdk = 'sciter-js-sdk'
        ret = os.system('unzip -o {}.zip'.format(sciter_js_sdk))
        success = (ret == 0)
        if not success:
            print('failed to extract {}. code: {}'.format(sciter_js_sdk, ret))
            break

        # extracting spdlog
        spdlog = 'spdlog-1.9.2'
        ret = os.system('unzip -o {}.zip'.format(spdlog))
        success = (ret == 0)
        if not success:
            print('failed to extract {}. code: {}'.format(spdlog, ret))
            break

        # copy sciter.dll to release dir
        ret = os.system('copy /Y sciter-js-sdk\\bin\\windows\\x32\\sciter.dll ..\\bin\\Release')
        success = (ret == 0)
        if not success:
            print('failed to copy sciter.dll!')
            break

        # copy Qt5Core.dll to release dir
        ret = os.system('copy /Y Qt5Core.dll ..\\bin\\Release')
        success = (ret == 0)
        if not success:
            print('failed to copy Qt5Core.dll!')
            break
            
        condition = False

    print('exit 3rd folder')
    os.chdir('../')

    return success


def configure(domain, brand, native_version, ui_version):
    brand_name = brand['processName']
    company = brand['company']

    full_version = '{}.{}'.format(native_version, ui_version)

    # write resource versions
    write_resource_version('src/SuperAutoClicker/SuperAutoClicker.rc.template', brand_name, 'exe', '{} Main Application'.format(brand_name), company, full_version)
    write_resource_version('src/Installer/Installer.rc.template', '{}Installer'.format(brand_name), 'exe', '{} Installer'.format(brand_name), company, full_version)
    write_resource_version('src/Unstaller/Unstaller.rc.template', 'Uninst', 'exe', '{} Uninstaller'.format(brand_name), company, full_version)
    write_resource_version('src/PowerKit/PowerKit.rc.template', 'PowerKit', 'exe', '{} Toolkit'.format(brand_name), company, full_version)
    write_resource_version('src/InputHook/InputHook.rc.template', 'InputHook', 'dll', '{} Toolkit'.format(brand_name), company, full_version)

    # write native Version.h
    f = open('src/CommonLib/Version.h.template', 'r')
    src = f.read()
    f.close()
    src = src.replace('{VERSION}', native_version)
    f = open('src/CommonLib/Version.h', 'w')
    f.write(src)
    f.close()

    # write ui version
    f = open('src/UI/common/js/BrandConfig.js.template', 'r')
    src = f.read()
    f.close()
    src = src.replace('{UI_VERSION}', ui_version)
    src = src.replace('{SERVER_URL}', brand['serverURL'])
    src = src.replace('{BRAND_TITLE}', brand['logoTitle'])
    src = src.replace('{PROCESS_NAME}', brand_name)
    src = src.replace('{APP_ID}', '{}'.format(brand['appId']))
    src = src.replace('{DOMAIN}', domain)
    src = src.replace('{COMPANY}', company)
    f = open('src/UI/common/js/BrandConfig.js', 'w')
    f.write(src)
    f.close()

    # write AppId.h
    f = open('src/CommonLib/AppId.h.template', 'r')
    src = f.read()
    f.close()
    src = src.replace('{APPID}', '{}'.format(brand['appId']))
    f = open('src/CommonLib/AppId.h', 'w')
    f.write(src)
    f.close()

    # write Domain.h
    f = open('src/CommonLib/Domain.h.template', 'r')
    src = f.read()
    f.close()
    src = src.replace('{DOMAIN}', 'http://localhost')
    f = open('src/CommonLib/Domain.h', 'w')
    f.write(src)
    f.close()

    # write Company.h
    f = open('src/CommonLib/Company.h.template', 'r')
    src = f.read()
    f.close()
    src = src.replace('{COMPANY}', company)
    f = open('src/CommonLib/Company.h', 'w')
    f.write(src)
    f.close()


def get_matched(text, pattern):
    r = re.findall(pattern, text)
    if len(r) > 0:
        matched = r[0].strip()
        return matched
    else:
        return u''

def write_resource_version(template_file, brand_name, file_suffix, desc, company, full_version):
    print('write resource version for {}'.format(brand_name))

    major_version = get_matched(full_version, u'(\d+)\.\d+\.\d+\.\d+')
    # print('major version: {}'.format(major_version))
    minor_version = get_matched(full_version, u'\d+\.(\d+)\.\d+\.\d+')
    # print('minor version: {}'.format(minor_version))
    patch_version = get_matched(full_version, u'\d+\.\d+\.(\d)+\.\d+')
    # print('patch version: {}'.format(patch_version))
    tail_version = get_matched(full_version, u'\d+\.\d+\.\d+\.(\d+)')
    # print('tail version: {}'.format(tail_version))

    PRODUCT_VERSION = '{},{},{},{}'.format(major_version, minor_version, patch_version, tail_version)
    Product_Version = full_version

    f = open(template_file, 'r')
    src = f.read()
    f.close()

    src = src.replace('{FILE_VERSION}', PRODUCT_VERSION)
    src = src.replace('{PRODUCT_VERSION}', PRODUCT_VERSION)
    src = src.replace('{Company_Name}', company)
    src = src.replace('{File_Description}', desc)
    src = src.replace('{File_Version}', Product_Version)
    src = src.replace('{Interal_Name}', brand_name)
    src = src.replace('{Legel_Copyright}', 'Copyright (C) 2020-{} {}'.format(datetime.datetime.now().year, company))
    src = src.replace('{Original_File_Name}', '{}.{}'.format(brand_name, file_suffix))
    src = src.replace('{Product_Name}', brand_name)
    src = src.replace('{Product_Version}', Product_Version)

    rc_file = template_file.replace('.template', '')
    print('rc file: {}'.format(rc_file))
    f = open(rc_file, 'w')
    f.write(src)
    f.close()

    pass


if __name__ == "__main__":
    start_configure()