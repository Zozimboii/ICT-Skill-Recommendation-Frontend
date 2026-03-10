<!-- pages/admin/index.vue -->
<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin';
import type { AdminStats, AdminUserItem, AdminJobItem, AdminSkillItem } from '~/types/Admin';

useHead({ title: 'Admin — ICT Skill' });

const { getStats, getUsers, toggleUser, getJobs, deleteJob, getSkills, createSkill, deleteSkill, triggerScrape } = useAdmin();

type Tab = 'users' | 'jobs' | 'skills';
const activeTab = ref<Tab>('users');

const stats = ref<AdminStats | null>(null);
const users = ref<AdminUserItem[]>([]);
const jobs = ref<AdminJobItem[]>([]);
const jobTotal = ref(0);
const skills = ref<AdminSkillItem[]>([]);

const loading = ref(true);
const actionLoading = ref(false);
const toast = ref<{ msg: string; type: 'ok' | 'err' } | null>(null);

// New skill form
const newSkillName = ref('');
const newSkillType = ref<'hard_skill' | 'soft_skill'>('hard_skill');

// Job search
const jobKeyword = ref('');

const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    toast.value = { msg, type };
    setTimeout(() => (toast.value = null), 3000);
};

const loadAll = async () => {
    loading.value = true;
    stats.value = await getStats();
    users.value = await getUsers();
    const jobRes = await getJobs();
    jobs.value = jobRes.data;
    jobTotal.value = jobRes.total;
    skills.value = await getSkills();
    loading.value = false;
};

const searchJobs = async () => {
    const res = await getJobs({ keyword: jobKeyword.value || undefined });
    jobs.value = res.data;
    jobTotal.value = res.total;
};

const handleToggleUser = async (user: AdminUserItem) => {
    actionLoading.value = true;
    try {
        const updated = await toggleUser(user.id, !user.is_active);
        if (updated) {
            const idx = users.value.findIndex((u) => u.id === user.id);
            if (idx !== -1) users.value[idx] = updated;
        }
        showToast(`${user.email} — ${!user.is_active ? 'เปิด' : 'ปิด'}ใช้งานแล้ว`);
    } catch {
        showToast('เกิดข้อผิดพลาด', 'err');
    } finally {
        actionLoading.value = false;
    }
};

const handleDeleteJob = async (job: AdminJobItem) => {
    if (!confirm(`ลบ "${job.title}" ?`)) return;
    actionLoading.value = true;
    try {
        await deleteJob(job.id);
        jobs.value = jobs.value.filter((j) => j.id !== job.id);
        jobTotal.value--;
        showToast('ลบงานเรียบร้อย');
    } catch {
        showToast('ลบไม่สำเร็จ', 'err');
    } finally {
        actionLoading.value = false;
    }
};

const handleAddSkill = async () => {
    if (!newSkillName.value.trim()) return;
    actionLoading.value = true;
    try {
        const created = await createSkill(newSkillName.value.trim(), newSkillType.value);
        if (created) skills.value.unshift(created);
        newSkillName.value = '';
        showToast('เพิ่ม skill เรียบร้อย');
    } catch (e: any) {
        showToast(e?.data?.detail || 'เพิ่มไม่สำเร็จ', 'err');
    } finally {
        actionLoading.value = false;
    }
};

const handleDeleteSkill = async (skill: AdminSkillItem) => {
    if (!confirm(`ลบ skill "${skill.name}" ?`)) return;
    actionLoading.value = true;
    try {
        await deleteSkill(skill.id);
        skills.value = skills.value.filter((s) => s.id !== skill.id);
        showToast('ลบ skill เรียบร้อย');
    } catch {
        showToast('ลบไม่สำเร็จ', 'err');
    } finally {
        actionLoading.value = false;
    }
};

const handleScrape = async () => {
    if (!confirm('เริ่ม scrape งานใหม่ 50 ตำแหน่ง?')) return;
    actionLoading.value = true;
    try {
        const res = await triggerScrape(50);
        showToast(res?.message ?? 'Scrape เสร็จ');
        await loadAll();
    } catch {
        showToast('Scrape ไม่สำเร็จ', 'err');
    } finally {
        actionLoading.value = false;
    }
};

onMounted(async () => {
    await nextTick(); // รอให้ useState sync จาก cookie ก่อน
    loadAll();
});
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center flex-wrap gap-3">
            <h1 class="text-3xl font-bold text-white">Admin</h1>
            <button
                :disabled="actionLoading"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                @click="handleScrape"
            >
                <span :class="actionLoading ? 'animate-spin' : ''">⚙️</span>
                Scrape งานใหม่
            </button>
        </div>

        <!-- Toast -->
        <Transition name="fade">
            <div
                v-if="toast"
                class="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
                :style="toast.type === 'ok' ? 'background:#1a8c3e; color:#fff' : 'background:#b91c1c; color:#fff'"
            >
                {{ toast.msg }}
            </div>
        </Transition>

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="rounded-2xl p-5 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3" style="background: rgba(42, 127, 212, 0.15)" />
            </div>
        </div>

        <template v-else>
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="card in [
                        { icon: '👥', label: 'Users', value: stats?.total_users ?? 0 },
                        { icon: '💼', label: 'Jobs', value: stats?.total_jobs ?? 0 },
                        { icon: '🔧', label: 'Skills', value: stats?.total_skills ?? 0 },
                        { icon: '📄', label: 'Transcripts', value: stats?.total_transcripts ?? 0 },
                    ]"
                    :key="card.label"
                    class="rounded-2xl p-5 flex items-center gap-3"
                    style="background: rgba(8, 18, 36, 0.7); border: 1px solid rgba(42, 127, 212, 0.15)"
                >
                    <span class="text-3xl">{{ card.icon }}</span>
                    <div>
                        <p class="text-2xl font-extrabold text-white">{{ card.value.toLocaleString() }}</p>
                        <p class="text-xs uppercase tracking-widest text-slate-500">{{ card.label }}</p>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-2">
                <button
                    v-for="tab in [
                        { key: 'users', label: '👥 Users' },
                        { key: 'jobs', label: '💼 Jobs' },
                        { key: 'skills', label: '🔧 Skills' },
                    ]"
                    :key="tab.key"
                    class="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                    :style="activeTab === tab.key ? 'background: rgba(13,95,163,0.2); border-color: rgba(42,159,214,0.4); color: #5bc4f5;' : 'border-color: rgba(255,255,255,0.1); color: #94a3b8;'"
                    @click="activeTab = tab.key as Tab"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- ── USERS TAB ── -->
            <div v-if="activeTab === 'users'" class="rounded-2xl overflow-hidden" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-xs uppercase tracking-widest text-slate-500" style="border-bottom: 1px solid rgba(42, 127, 212, 0.15)">
                            <th class="px-5 py-4 text-left font-semibold">ชื่อ</th>
                            <th class="px-5 py-4 text-left font-semibold">Email</th>
                            <th class="px-5 py-4 text-left font-semibold">Role</th>
                            <th class="px-5 py-4 text-center font-semibold">สถานะ</th>
                            <th class="px-5 py-4 text-center font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="user in users"
                            :key="user.id"
                            class="transition-colors"
                            style="border-bottom: 1px solid rgba(42, 127, 212, 0.06)"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.06)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                        >
                            <td class="px-5 py-4 text-white font-medium">{{ user.first_name }} {{ user.last_name }}</td>
                            <td class="px-5 py-4 text-slate-400">{{ user.email }}</td>
                            <td class="px-5 py-4">
                                <span
                                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                    :style="
                                        user.role === 'admin'
                                            ? 'background: rgba(251,146,60,0.12); color:#fb923c; border:1px solid rgba(251,146,60,0.3)'
                                            : 'background: rgba(42,127,212,0.1); color:#5bc4f5; border:1px solid rgba(42,127,212,0.25)'
                                    "
                                >
                                    {{ user.role }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span
                                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                    :style="
                                        user.is_active
                                            ? 'background: rgba(76,175,80,0.1); color:#81c784; border:1px solid rgba(76,175,80,0.3)'
                                            : 'background: rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.25)'
                                    "
                                >
                                    {{ user.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <button
                                    :disabled="actionLoading || user.role === 'admin'"
                                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                                    :style="
                                        user.is_active
                                            ? 'background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.25)'
                                            : 'background:rgba(76,175,80,0.1); color:#81c784; border:1px solid rgba(76,175,80,0.3)'
                                    "
                                    @click="handleToggleUser(user)"
                                >
                                    {{ user.is_active ? 'Deactivate' : 'Activate' }}
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!users.length">
                            <td colspan="5" class="px-5 py-10 text-center text-slate-500">ไม่พบข้อมูล</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ── JOBS TAB ── -->
            <div v-if="activeTab === 'jobs'" class="space-y-4">
                <!-- Search -->
                <div class="flex gap-2">
                    <input
                        v-model="jobKeyword"
                        type="text"
                        placeholder="ค้นหาชื่องาน..."
                        class="flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none text-sm transition-all"
                        style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                        @keydown.enter="searchJobs"
                    />
                    <button class="px-5 py-3 rounded-xl text-sm font-semibold text-white" style="background: rgba(13, 95, 163, 0.3); border: 1px solid rgba(42, 127, 212, 0.3)" @click="searchJobs">
                        ค้นหา
                    </button>
                </div>
                <p class="text-sm text-slate-500">ทั้งหมด {{ jobTotal.toLocaleString() }} งาน</p>

                <div class="rounded-2xl overflow-hidden" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500" style="border-bottom: 1px solid rgba(42, 127, 212, 0.15)">
                                <th class="px-5 py-4 text-left font-semibold">ชื่องาน</th>
                                <th class="px-5 py-4 text-left font-semibold">บริษัท</th>
                                <th class="px-5 py-4 text-left font-semibold">สาย</th>
                                <th class="px-5 py-4 text-center font-semibold">Skills</th>
                                <th class="px-5 py-4 text-center font-semibold">ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="job in jobs"
                                :key="job.id"
                                class="transition-colors"
                                style="border-bottom: 1px solid rgba(42, 127, 212, 0.06)"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.06)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                            >
                                <td class="px-5 py-4 text-white font-medium max-w-xs truncate">{{ job.title }}</td>
                                <td class="px-5 py-4 text-slate-400 truncate">{{ job.company_name }}</td>
                                <td class="px-5 py-4 text-sm" style="color: #4caf50">{{ job.sub_category ?? '-' }}</td>
                                <td class="px-5 py-4 text-center text-slate-400">{{ job.skill_count }}</td>
                                <td class="px-5 py-4 text-center">
                                    <button
                                        :disabled="actionLoading"
                                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                                        style="background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25)"
                                        @click="handleDeleteJob(job)"
                                    >
                                        🗑 ลบ
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!jobs.length">
                                <td colspan="5" class="px-5 py-10 text-center text-slate-500">ไม่พบข้อมูล</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── SKILLS TAB ── -->
            <div v-if="activeTab === 'skills'" class="space-y-4">
                <!-- Add form -->
                <div class="rounded-2xl p-5 flex flex-wrap gap-3 items-end" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="flex-1 min-w-[180px]">
                        <label class="text-xs uppercase tracking-widest font-semibold mb-1.5 block" style="color: #5bc4f5">Skill Name</label>
                        <input
                            v-model="newSkillName"
                            type="text"
                            placeholder="เช่น FastAPI"
                            class="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none text-sm"
                            style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                            @keydown.enter="handleAddSkill"
                        />
                    </div>
                    <div class="min-w-[140px]">
                        <label class="text-xs uppercase tracking-widest font-semibold mb-1.5 block" style="color: #5bc4f5">Type</label>
                        <select
                            v-model="newSkillType"
                            class="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
                            style="background: rgba(8, 18, 36, 0.9); border: 1px solid rgba(42, 127, 212, 0.2)"
                        >
                            <option value="hard_skill">Hard Skill</option>
                            <option value="soft_skill">Soft Skill</option>
                        </select>
                    </div>
                    <button
                        :disabled="actionLoading || !newSkillName.trim()"
                        class="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                        style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                        @click="handleAddSkill"
                    >
                        + เพิ่ม Skill
                    </button>
                </div>

                <!-- Skills table -->
                <div class="rounded-2xl overflow-hidden" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500" style="border-bottom: 1px solid rgba(42, 127, 212, 0.15)">
                                <th class="px-5 py-4 text-left font-semibold">ชื่อ Skill</th>
                                <th class="px-5 py-4 text-left font-semibold">Type</th>
                                <th class="px-5 py-4 text-center font-semibold">Jobs ที่ใช้</th>
                                <th class="px-5 py-4 text-center font-semibold">ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="skill in skills"
                                :key="skill.id"
                                class="transition-colors"
                                style="border-bottom: 1px solid rgba(42, 127, 212, 0.06)"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.06)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                            >
                                <td class="px-5 py-3 text-white font-medium">{{ skill.name }}</td>
                                <td class="px-5 py-3">
                                    <span
                                        class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                        :style="
                                            skill.skill_type === 'hard_skill'
                                                ? 'background:rgba(42,127,212,0.1);color:#5bc4f5;border:1px solid rgba(42,127,212,0.25)'
                                                : 'background:rgba(76,175,80,0.1);color:#81c784;border:1px solid rgba(76,175,80,0.3)'
                                        "
                                    >
                                        {{ skill.skill_type === 'hard_skill' ? 'Hard' : 'Soft' }}
                                    </span>
                                </td>
                                <td class="px-5 py-3 text-center text-slate-400">{{ skill.job_count }}</td>
                                <td class="px-5 py-3 text-center">
                                    <button
                                        :disabled="actionLoading || skill.job_count > 0"
                                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                                        :title="skill.job_count > 0 ? 'ไม่สามารถลบได้เพราะมี job ใช้อยู่' : ''"
                                        style="background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25)"
                                        @click="handleDeleteSkill(skill)"
                                    >
                                        🗑 ลบ
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!skills.length">
                                <td colspan="4" class="px-5 py-10 text-center text-slate-500">ไม่พบข้อมูล</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.3s,
        transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
