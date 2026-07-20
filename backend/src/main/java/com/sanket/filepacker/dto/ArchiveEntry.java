package com.sanket.filepacker.dto;

/** Metadata for one entry in an archive — read from its header, no content decoding. */
public record ArchiveEntry(String name, long size) {}
