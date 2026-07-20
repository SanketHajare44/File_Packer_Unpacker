package com.sanket.filepacker.dto;

/** A single file recovered from an SRH3 archive, decoded and ready to write out. */
public record ExtractedFile(String name, byte[] content) {}
