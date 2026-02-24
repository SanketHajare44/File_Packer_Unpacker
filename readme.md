# File Packer Unpacker

This project is a Java-based utility that combines multiple files into a single packed file and restores them back when needed. It uses a custom header format to store file metadata and applies XOR encryption to protect file data during packing and unpacking.

The goal of this project was to understand how file archiving works internally and to gain hands-on experience with Java File I/O and byte-level data handling.

## Features

* Packs multiple files from a folder into one archive file
* Restores original files from the packed file
* Stores file name and file size as metadata
* Encrypts and decrypts file data using XOR encryption
* Uses Java FileInputStream and FileOutputStream

## Project Structure

```
File_Packer_Unpacker/
│
├── src/
│   ├── Packer.java
│   └── Unpacker.java
│
├── sample_files/      # Sample input files for testing
│
├── packed.dat        # Generated packed file (after running packer)
│
├── README.md
└── .gitignore
```

## How to run

Compile:

```bash
javac src/Packer.java
javac src/Unpacker.java
```

Run packer:

```bash
java -cp src Packer sample_files packed.dat
```

Run unpacker:

```bash
java -cp src Unpacker packed.dat
```

## Technologies used

Java, FileInputStream, FileOutputStream, byte-level file handling

## Author

* Sanket Sadashiv Hajare
* GitHub   : https://github.com/SanketHajare44
* LinkedIn : https://www.linkedin.com/in/sankethajare


## License
* MIT License © 2026 Sanket Sadashiv Hajare
* This project is licensed under the MIT License. See the LICENSE file for details.
