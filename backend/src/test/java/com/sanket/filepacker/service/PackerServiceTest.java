package com.sanket.filepacker.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class PackerServiceTest {

    private final PackerService packerService = new PackerService();

    @Test
    void packedArchiveStartsWithMagicNumber() throws Exception {
        MultipartFile file = new MockMultipartFile("files", "hello.txt", "text/plain",
                "hello world".getBytes(StandardCharsets.UTF_8));

        byte[] archive = packerService.pack(new MultipartFile[]{file});

        String magic = new String(archive, 0, 4, StandardCharsets.US_ASCII);
        assertEquals("SRH3", magic);
    }

    @Test
    void packingNoFilesThrows() {
        assertThrows(IllegalArgumentException.class, () -> packerService.pack(new MultipartFile[0]));
        assertThrows(IllegalArgumentException.class, () -> packerService.pack(null));
    }

    @Test
    void headerContainsNameAndSizePaddedTo100Bytes() throws Exception {
        MultipartFile file = new MockMultipartFile("files", "a.txt", "text/plain",
                "abc".getBytes(StandardCharsets.UTF_8));

        byte[] archive = packerService.pack(new MultipartFile[]{file});

        // Header sits right after the 4-byte magic number and is always exactly 100 bytes.
        byte[] header = new byte[100];
        System.arraycopy(archive, 4, header, 0, 100);
        String headerStr = new String(header, StandardCharsets.US_ASCII).trim();

        assertEquals("a.txt 3", headerStr);
        assertEquals(4 + 100 + 3, archive.length, "archive should be magic + header + XORed content");
    }

    @Test
    void contentIsXoredWithKey0x11() throws Exception {
        byte[] original = {0x00, 0x01, (byte) 0xFF, 0x11};
        MultipartFile file = new MockMultipartFile("files", "raw.bin", "application/octet-stream", original);

        byte[] archive = packerService.pack(new MultipartFile[]{file});

        byte[] content = new byte[original.length];
        System.arraycopy(archive, 4 + 100, content, 0, original.length);

        for (int i = 0; i < original.length; i++) {
            assertEquals((byte) (original[i] ^ 0x11), content[i]);
        }
    }

    @Test
    void fileNameTooLongForHeaderThrows() {
        String longName = "a".repeat(120) + ".txt";
        MultipartFile file = new MockMultipartFile("files", longName, "text/plain",
                "x".getBytes(StandardCharsets.UTF_8));

        assertThrows(IllegalArgumentException.class, () -> packerService.pack(new MultipartFile[]{file}));
    }

    @Test
    void multipleFilesAreConcatenatedInOrder() throws Exception {
        MultipartFile a = new MockMultipartFile("files", "a.txt", "text/plain", "aa".getBytes(StandardCharsets.UTF_8));
        MultipartFile b = new MockMultipartFile("files", "b.txt", "text/plain", "bbb".getBytes(StandardCharsets.UTF_8));

        byte[] archive = packerService.pack(new MultipartFile[]{a, b});

        // magic(4) + header(100) + "aa"(2) + header(100) + "bbb"(3)
        assertEquals(4 + 100 + 2 + 100 + 3, archive.length);
    }
}
