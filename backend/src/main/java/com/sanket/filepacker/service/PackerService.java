package com.sanket.filepacker.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/*
    Ports the exact SRH3 archive format from the original packer.java /
    unpacker.java CLI tools, so archives produced here can still be
    unpacked with the original Java CLI tool and vice versa.

    Format (unchanged from the CLI version):
      [4 bytes]  magic "SRH3"
      per file:
        [100 bytes] header: "<name> <sizeInBytes>" space-padded to 100 bytes, NOT encrypted
        [N bytes]   file content, each byte XORed with key 0x11

    Author: Sanket Sadashiv Hajare
*/
@Service
public class PackerService {

    private static final String MAGIC = "SRH3";
    private static final byte KEY = 0x11;
    private static final int HEADER_SIZE = 100;
    private static final int BUFFER_SIZE = 4096;

    /**
     * Packs the given files into a single SRH3 archive, in memory.
     *
     * @param files the files to pack (folder contents, as selected in the browser)
     * @return the fully assembled archive bytes, ready to be streamed back to the client
     */
    public byte[] pack(MultipartFile[] files) throws IOException {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided to pack.");
        }

        ByteArrayOutputStream archive = new ByteArrayOutputStream();
        archive.write(MAGIC.getBytes(StandardCharsets.US_ASCII));

        for (MultipartFile file : files) {
            if (file.isEmpty() && file.getOriginalFilename() == null) {
                continue;
            }

            String name = sanitizeName(file.getOriginalFilename());
            long size = file.getSize();

            archive.write(buildHeader(name, size));

            try (InputStream in = file.getInputStream()) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    for (int i = 0; i < bytesRead; i++) {
                        buffer[i] = (byte) (buffer[i] ^ KEY);
                    }
                    archive.write(buffer, 0, bytesRead);
                }
            }
        }

        return archive.toByteArray();
    }

    private byte[] buildHeader(String name, long size) {
        String header = name + " " + size;
        if (header.length() > HEADER_SIZE) {
            throw new IllegalArgumentException(
                "File name too long to fit the archive header (100-byte limit): " + name);
        }
        StringBuilder sb = new StringBuilder(header);
        while (sb.length() < HEADER_SIZE) {
            sb.append(" ");
        }
        return sb.toString().getBytes(StandardCharsets.US_ASCII);
    }

    /** Strip any directory components the browser might include, keep just the file name. */
    private String sanitizeName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "unnamed";
        }
        String normalized = originalName.replace("\\", "/");
        int lastSlash = normalized.lastIndexOf('/');
        return lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
    }
}
