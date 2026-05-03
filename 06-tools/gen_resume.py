# -*- coding: utf-8 -*-
import os
import platform
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

def setup_chinese_pdf():
    system = platform.system()
    if system == "Windows":
        candidates = []
        dirs = []
        windir = os.environ.get("WINDIR", "C:\\Windows")
        dirs.append(os.path.join(windir, "Fonts"))
        local = os.environ.get("LOCALAPPDATA", "")
        if local:
            dirs.append(os.path.join(local, "Microsoft", "Windows", "Fonts"))
        for d in dirs:
            for fname, name, idx in [
                ("msyh.ttc","MicrosoftYaHei",0),
                ("simhei.ttf","SimHei",0),
                ("simsun.ttc","SimSun",0),
            ]:
                candidates.append((os.path.join(d, fname), name, idx))
    elif system == "Darwin":
        candidates = [
            ("/System/Library/Fonts/STHeiti Light.ttc", "STHeiti", 0),
            ("/System/Library/Fonts/STHeiti Medium.ttc", "STHeitiMedium", 0),
        ]
    else:
        candidates = [
            ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", "NotoSansCJK", 0),
            ("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", "WQYZenHei", 0),
        ]
    cn_font = None
    for font_path, font_name, idx in candidates:
        if os.path.exists(font_path):
            try:
                pdfmetrics.registerFont(TTFont(font_name, font_path, subfontIndex=idx))
                cn_font = font_name
                break
            except Exception:
                continue
    if cn_font is None:
        raise RuntimeError("No CJK font found")
    styles = getSampleStyleSheet()
    for style in styles.byName.values():
        if isinstance(style, ParagraphStyle):
            style.fontName = cn_font
    return cn_font, styles

cn_font, styles = setup_chinese_pdf()

# Custom styles
title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=22, alignment=TA_CENTER, spaceAfter=6)
subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=10, alignment=TA_CENTER, textColor=colors.grey)
section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=12, textColor=colors.HexColor("#2E5090"), spaceBefore=12, spaceAfter=6)
normal_style = ParagraphStyle("Normal", parent=styles["Normal"], fontSize=10, leading=14)
bullet_style = ParagraphStyle("Bullet", parent=styles["Normal"], fontSize=10, leading=14, leftIndent=12)

out = os.path.join(os.path.expanduser("~"), "Desktop", "resume_chenwei.pdf")
doc = SimpleDocTemplate(out, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)

story = []

# Header
story.append(Paragraph("陈 伟", title_style))
story.append(Paragraph("求职意向：软件开发工程师 | 电话：138-5678-9012 | 邮箱：chenwei2024@email.com", subtitle_style))
story.append(Spacer(1, 12))

# Education
story.append(Paragraph("教育背景", section_style))
edu_data = [
    [Paragraph("<b>广东科技学院</b> | 计算机科学与技术 | 本科 | 2020.09 - 2024.06", normal_style)],
    [Paragraph("GPA: 3.2/4.0，专业排名前40%", bullet_style)],
    [Paragraph("主修课程：数据结构、操作系统、计算机网络、Java程序设计、数据库原理、软件工程", bullet_style)],
    [Paragraph("在校荣誉：优秀学生干部、三等奖学金", bullet_style)],
]
edu_table = Table(edu_data, colWidths=[16*cm])
edu_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 3),
]))
story.append(edu_table)
story.append(Spacer(1, 6))

# Skills
story.append(Paragraph("专业技能", section_style))
skills_data = [
    [Paragraph("编程语言：Java（熟悉）、Python（了解）、JavaScript（了解）", bullet_style)],
    [Paragraph("开发框架：Spring Boot、Spring MVC、MyBatis", bullet_style)],
    [Paragraph("数据库：MySQL、Redis（基础）", bullet_style)],
    [Paragraph("开发工具：Git、Maven、IDEA、VS Code", bullet_style)],
    [Paragraph("其他：Linux基础命令、RESTful API设计", bullet_style)],
]
skills_table = Table(skills_data, colWidths=[16*cm])
skills_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2),
]))
story.append(skills_table)
story.append(Spacer(1, 6))

# Projects
story.append(Paragraph("项目经历", section_style))

story.append(Paragraph("<b>校园图书管理系统</b> | 课程设计项目 | 2023.03 - 2023.06", normal_style))
proj1_data = [
    [Paragraph("技术栈：Java + Spring Boot + MySQL + Thymeleaf", bullet_style)],
    [Paragraph("项目描述：为校内图书馆开发的图书借阅管理系统，实现图书查询、借阅、归还等功能", bullet_style)],
    [Paragraph("主要职责：负责后端接口开发，实现图书CRUD操作和借阅记录管理", bullet_style)],
    [Paragraph("项目成果：完成基本功能开发，获得课程设计良好成绩", bullet_style)],
]
proj1_table = Table(proj1_data, colWidths=[16*cm])
proj1_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2),
]))
story.append(proj1_table)
story.append(Spacer(1, 6))

story.append(Paragraph("<b>个人博客系统</b> | 个人练手项目 | 2023.09 - 2023.12", normal_style))
proj2_data = [
    [Paragraph("技术栈：Spring Boot + MyBatis + MySQL + Vue.js", bullet_style)],
    [Paragraph("项目描述：基于前后端分离架构的个人博客平台，支持文章发布、评论、分类管理", bullet_style)],
    [Paragraph("主要职责：独立完成后端API开发，包括用户认证、文章管理、评论功能", bullet_style)],
    [Paragraph("项目成果：实现基础功能，部署到阿里云服务器，积累全栈开发经验", bullet_style)],
]
proj2_table = Table(proj2_data, colWidths=[16*cm])
proj2_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2),
]))
story.append(proj2_table)
story.append(Spacer(1, 6))

# Campus Experience
story.append(Paragraph("在校经历", section_style))
campus_data = [
    [Paragraph("<b>计算机协会</b> | 技术部成员 | 2021.09 - 2022.06", normal_style)],
    [Paragraph("参与协会技术分享活动，协助组织编程入门讲座", bullet_style)],
    [Paragraph("帮助新生解答编程学习问题，积累沟通表达能力", bullet_style)],
    [Paragraph("<b>班级学习委员</b> | 2022.09 - 2023.06", normal_style)],
    [Paragraph("协助老师收发作业，组织班级学习交流活动", bullet_style)],
    [Paragraph("获得优秀学生干部荣誉称号", bullet_style)],
]
campus_table = Table(campus_data, colWidths=[16*cm])
campus_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2),
]))
story.append(campus_table)
story.append(Spacer(1, 6))

# Self Evaluation
story.append(Paragraph("自我评价", section_style))
story.append(Paragraph("热爱软件开发，具备扎实的编程基础和良好的学习能力。在校期间通过课程项目和个人练习积累了Java后端开发经验，熟悉Spring Boot框架和MySQL数据库。工作态度认真负责，具备良好的团队协作精神和沟通能力。作为应届生，期待在实际工作中快速成长，为团队创造价值。", normal_style))

doc.build(story)
print("PDF saved:", out)
