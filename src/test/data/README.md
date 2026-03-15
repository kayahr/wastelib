# Test data

The test files in this folder are NOT the copyrighted original wasteland files. The files use the original file formats but the content is self-made and can be seen in the [expected](../expected/) folder.

The `wlu.exe` file is an unpacked "Hello World" executable with the same size as the original unpacked wasteland executable. It just contains test strings, offsets and size values. The file is created with the `create-exe.js` file which uses `hello.exe` as base and fills it with the test data.

The `wl.exe` file is a compressed version of `wlu.exe`, created by [exepack](https://www.bamsoftware.com/software/exepack/), which is expected to be available in `PATH`.
