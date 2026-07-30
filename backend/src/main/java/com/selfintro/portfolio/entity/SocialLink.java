package com.selfintro.portfolio.entity;

/**
 * A simple labelled link (e.g. GitHub, Email, Weibo). Stored as JSON inside Profile.
 */
public record SocialLink(String label, String url) {
}
