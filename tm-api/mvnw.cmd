@ECHO OFF
SETLOCAL

SET MAVEN_PROJECTBASEDIR=%~dp0

:findBaseDir
IF EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties" GOTO baseDirFound
SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%..\
IF "%MAVEN_PROJECTBASEDIR%"=="%MAVEN_PROJECTBASEDIR%..\" GOTO baseDirNotFound
GOTO findBaseDir

:baseDirNotFound
ECHO Cannot find .mvn\wrapper\maven-wrapper.properties 1>&2
EXIT /B 1

:baseDirFound
SET WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties
SET WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar

IF NOT EXIST "%WRAPPER_JAR%" (
  FOR /F "tokens=2 delims==" %%A IN ('findstr /R /C:"^wrapperUrl=" "%WRAPPER_PROPERTIES%"') DO SET WRAPPER_URL=%%A
  IF "%WRAPPER_URL%"=="" SET WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
  ECHO Downloading Maven Wrapper from %WRAPPER_URL% 1>&2
  IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper" MKDIR "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper"
  POWERSHELL -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
  IF ERRORLEVEL 1 (
    ECHO Failed to download Maven Wrapper jar 1>&2
    EXIT /B 1
  )
)

SET JAVA_EXE=java
IF NOT "%JAVA_HOME%"=="" SET JAVA_EXE=%JAVA_HOME%\bin\java

"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
ENDLOCAL
