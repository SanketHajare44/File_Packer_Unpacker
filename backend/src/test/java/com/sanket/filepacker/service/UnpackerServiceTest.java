package com.sanket.filepacker.service;

import com.sanket.filepacker.dto.ArchiveEntry;
import com.sanket.filepacker.dto.ExtractedFile;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UnpackerServiceTest {

    private final PackerService packerService = new PackerService();
    private final UnpackerService unpackerService = new UnpackerService();

    @Test
    void roundTripPreservesFileContentAndOrder() throws Exception {
        MultipartFile a = new MockMultipartFile("files", "notes.txt", "text/plain",
                "meeting notes".getBytes(StandardCharsets.UTF_8));
        MultipartFile b = new MockMultipartFile("files", "data.bin", "application/octet-stream",
                new byte[]{0, 1, 2, 3, (byte) 255});

        byte[] archive = packerService.pack(new MultipartFile[]{a, b});
        List<ExtractedFile> extracted = unpackerService.unpack(archive);

        assertEquals(2, extracted.size());
        assertEquals("notes.txt", extracted.get(0).name());
        assertArrayEquals("meeting notes".getBytes(StandardCharsets.UTF_8), extracted.get(0).content());
        assertEquals("data.bin", extracted.get(1).name());
        assertArrayEquals(new byte[]{0, 1, 2, 3, (byte) 255}, extracted.get(1).content());
    }

    @Test
    void inspectReturnsMetadataWithoutDecodingContent() throws Exception {
        MultipartFile a = new MockMultipartFile("files", "one.txt", "text/plain",
                "12345".getBytes(StandardCharsets.UTF_8));

        byte[] archive = packerService.pack(new MultipartFile[]{a});
        List<ArchiveEntry> entries = unpackerService.inspect(archive);

        assertEquals(1, entries.size());
        assertEquals("one.txt", entries.get(0).name());
        assertEquals(5, entries.get(0).size());
    }

    @Test
    void rejectsWrongMagicNumber() {
        byte[] bogus = "NOPE-not-an-archive".getBytes(StandardCharsets.US_ASCII);
        assertThrows(IllegalArgumentException.class, () -> unpackerService.unpack(bogus));
        assertThrows(IllegalArgumentException.class, () -> unpackerService.inspect(bogus));
    }

    @Test
    void rejectsTruncatedArchive() throws Exception {
        MultipartFile a = new MockMultipartFile("files", "big.txt", "text/plain",
                "0123456789".getBytes(StandardCharsets.UTF_8));
        byte[] archive = packerService.pack(new MultipartFile[]{a});

        // Chop off the last few content bytes so the declared size no longer matches what's left.
        byte[] truncated = new byte[archive.length - 5];
        System.arraycopy(archive, 0, truncated, 0, truncated.length);

        assertThrows(IllegalArgumentException.class, () -> unpackerService.unpack(truncated));
    }

    @Test
    void rejectsArchiveThatIsJustTheMagicNumber() {
        byte[] onlyMagic = "SRH3".getBytes(StandardCharsets.US_ASCII);
        assertThrows(IllegalArgumentException.class, () -> unpackerService.unpack(onlyMagic));
    }
}
