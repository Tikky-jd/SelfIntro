package com.selfintro.portfolio.service;

import com.selfintro.portfolio.entity.*;
import com.selfintro.portfolio.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SeedService implements CommandLineRunner {

    private final AdminUserRepository adminRepo;
    private final ProfileRepository profileRepo;
    private final ResumeItemRepository resumeRepo;
    private final PostRepository postRepo;
    private final WorkRepository workRepo;
    private final PasswordEncoder passwordEncoder;

    private final String adminUsername;
    private final String adminPassword;

    public SeedService(AdminUserRepository adminRepo,
                       ProfileRepository profileRepo,
                       ResumeItemRepository resumeRepo,
                       PostRepository postRepo,
                       WorkRepository workRepo,
                       PasswordEncoder passwordEncoder,
                       @Value("${admin.username}") String adminUsername,
                       @Value("${admin.password}") String adminPassword) {
        this.adminRepo = adminRepo;
        this.profileRepo = profileRepo;
        this.resumeRepo = resumeRepo;
        this.postRepo = postRepo;
        this.workRepo = workRepo;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (adminRepo.count() == 0) {
            adminRepo.save(new AdminUser(adminUsername, passwordEncoder.encode(adminPassword)));
            System.out.println("[seed] created admin user: " + adminUsername);
        }

        if (profileRepo.count() == 0) {
            Profile p = new Profile();
            p.setId(1L);
            p.setName("你的名字");
            p.setHeadline("一句话介绍你自己，例如：全栈工程师 · 视觉设计爱好者");
            p.setAbout("在后台「个人资料」中编辑这段自我介绍，写清楚你的擅长领域、项目经历和联系方式。");
            p.setEmail("you@example.com");
            p.setLocation("中国 · 城市");
            p.setSocials(List.of(
                    new SocialLink("GitHub", "https://github.com/yourname"),
                    new SocialLink("Email", "mailto:you@example.com")
            ));
            profileRepo.save(p);
        }

        if (resumeRepo.count() == 0) {
            resumeRepo.save(new ResumeItem(ResumeCategory.EDUCATION, "计算机科学与技术 · 学士", "某某大学", "主修：数据结构、算法、操作系统、计算机网络。", "2018", "2022", 0));
            resumeRepo.save(new ResumeItem(ResumeCategory.EXPERIENCE, "后端开发工程师", "某某公司", "负责核心业务系统的设计与开发，参与微服务拆分。", "2022", "Present", 1));
            resumeRepo.save(new ResumeItem(ResumeCategory.SKILL, "技术栈", "Java, Spring Boot, MySQL, Redis, Vue3, TypeScript", "", 2));
            resumeRepo.save(new ResumeItem(ResumeCategory.PROJECT, "个人作品集网站", "", "使用 Vue3 + Spring Boot 构建的个人信息站点。", "", 3));
        }

        if (postRepo.count() == 0) {
            Post post = new Post();
            post.setTitle("欢迎来到我的个人网站");
            post.setSummary("这是一篇示例笔记，你可以在后台删除或替换它。");
            post.setContent("## 你好 👋\n\n这是通过 **Markdown** 渲染的内容示例。\n\n- 支持列表\n- 支持图片\n- 支持代码块\n\n```java\nSystem.out.println(\"Hello, world!\");\n```");
            post.setTags(List.of("示例", "笔记"));
            postRepo.save(post);
        }

        if (workRepo.count() == 0) {
            workRepo.save(new Work(
                    "示例作品",
                    "这是一张示例图片，可在后台替换为你的真实作品。",
                    MediaType.IMAGE,
                    "https://picsum.photos/seed/selfintro/1200/800",
                    "https://picsum.photos/seed/selfintro/1200/800"));
        }
    }
}
