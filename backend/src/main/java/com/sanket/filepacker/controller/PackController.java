package com.sanket.filepacker.controller;

import com.sanket.filepacker.dto.ArchiveEntry;
import com.sanket.filepacker.dto.ExtractedFile;
import com.sanket.filepacker.service.PackerService;
import com.sanket.filepacker.service.UnpackerService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api")
public class PackController {

    private final PackerService packerService;
    private final UnpackerService unpackerService;

    public PackController(PackerService packerService, UnpackerService unpackerService) {
        this.packerService = packerService;
        this.unpackerService = unpackerService;
    }

    @PostMapping(value = "/pack", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> pack(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "archiveName", defaultValue = "archive.srh") String archiveName
    ) throws IOException {

        byte[] packed = packerService.pack(files);

        String safeName = archiveName.isBlank() ? "archive.srh" : archiveName.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(safeName, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(packed);
    }

    @PostMapping(value = "/inspect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> inspect(@RequestParam("archive") MultipartFile archive) throws IOException {
        List<ArchiveEntry> entries = unpackerService.inspect(archive.getBytes());
        return ResponseEntity.ok(Map.of("entries", entries));
    }

    @PostMapping(value = "/unpack", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> unpack(@RequestParam("archive") MultipartFile archive) throws IOException {
        List<ExtractedFile> files = unpackerService.unpack(archive.getBytes());
        byte[] zipped = zip(files);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename("extracted.zip", StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipped);
    }

    private byte[] zip(List<ExtractedFile> files) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (ExtractedFile file : files) {
                zos.putNextEntry(new ZipEntry(file.name()));
                zos.write(file.content());
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
