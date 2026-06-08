from __future__ import annotations
from dataclasses import dataclass


@dataclass
class ModuleConfig:
    label: str
    prompt_template: str  # prompts/ 目录下的文件名（不含 .txt）


# 简历模块 → prompt 模板映射
MODULE_CONTEXT_MAP: dict[str, ModuleConfig] = {
    "internship": ModuleConfig(
        label="实习经历",
        prompt_template="internship",
    ),
    "project": ModuleConfig(
        label="项目经历",
        prompt_template="project",
    ),
    "self_intro": ModuleConfig(
        label="自我评价",
        prompt_template="self_intro",
    ),
    "skills": ModuleConfig(
        label="技能特长",
        prompt_template="skills",
    ),
}


def get_module_config(module_type: str) -> ModuleConfig | None:
    return MODULE_CONTEXT_MAP.get(module_type)


def list_modules() -> list[str]:
    return list(MODULE_CONTEXT_MAP.keys())
