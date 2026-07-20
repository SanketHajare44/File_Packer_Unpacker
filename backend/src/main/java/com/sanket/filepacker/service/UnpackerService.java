package com.sanket.filepacker.service;

import com.sanket.filepacker.dto.ArchiveEntry;
import com.sanket.filepacker.dto.ExtractedFile;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/*
    Ports the exact SRH3 archive format from the original unpacker.java CLI
    tool: validates the magic number, then walks 100-byte headers followed
    by XOR-encoded file content.

    Author: Sanket Sadashiv Hajare
*/
@Service
public class UnpackerService {

    private static final String MAGIC = "SRH3";
    private static final byte KEY = 0x11;
    private static final int HEADER_SIZE = 100;

    /** Lightweight scan: returns file names + sizes, without decoding any content. */
    public List<ArchiveEntry> inspect(byte[] archiveBytes) {
        List<ArchiveEntry> entries = new ArrayList<>();
        walk(archiveBytes, (name, size, contentStart) -> entries.add(new ArchiveEntry(name, size)));
        return entries;
    }

    /** Full extraction: returns every file with its content decoded (XOR key reversed). */
    public List<ExtractedFile> unpack(byte[] archiveBytes) {
        List<ExtractedFile> files = new ArrayList<>();
        walk(archiveBytes, (name, size, contentStart) -> {
            byte[] content = new byte[(int) size];
            for (int i = 0; i < size; i++) {
                content[i] = (byte) (archiveBytes[contentStart + i] ^ KEY);
            }
            files.add(new ExtractedFile(name, content));
        });
        return files;
    }

    @FunctionalInterface
    private interface EntryVisitor {
        void visit(String name, long size, int contentStart);
    }

    /** Shared header-walking logic used by both inspect() and unpack(). */
    private void walk(byte[] archiveBytes, EntryVisitor visitor) {
        if (archiveBytes.length < MAGIC.length()) {
            throw new IllegalArgumentException("Not a valid SRH3 archive: file is too small.");
        }

        String magic = new String(archiveBytes, 0, MAGIC.length(), StandardCharsets.US_ASCII);
        if (!MAGIC.equals(magic)) {
            throw new IllegalArgumentException("Not a valid SRH3 archive: magic number mismatch.");
        }

        int pos = MAGIC.length();
        int count = 0;

        while (pos + HEADER_SIZE <= archiveBytes.length) {
            String header = new String(archiveBytes, pos, HEADER_SIZE, StandardCharsets.US_ASCII).trim();
            pos += HEADER_SIZE;

            if (header.isEmpty()) {
                break;
            }

            String[] tokens = header.split(" ");
            if (tokens.length < 2) {
                break;
            }

            String name = tokens[0];
            long size;
            try {
                size = Long.parseLong(tokens[1]);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Corrupt archive: unreadable size for '" + name + "'.");
            }

            if (size < 0 || pos + size > archiveBytes.length) {
                throw new IllegalArgumentException(
                    "Corrupt archive: declared size for '" + name + "' exceeds the remaining data.");
            }

            visitor.visit(name, size, pos);
            pos += size;
            count++;
        }

        if (count == 0) {
            throw new IllegalArgumentException("Archive contained no files.");
        }
    }
}
