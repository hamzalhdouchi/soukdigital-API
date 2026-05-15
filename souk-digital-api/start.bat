@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
set PATH=%JAVA_HOME%\bin;%PATH%

for /f "usebackq tokens=1,* delims==" %%A in (`findstr /v "^#" "%~dp0.env"`) do (
    set "%%A=%%B"
)

cd /d "%~dp0"
mvn spring-boot:run
