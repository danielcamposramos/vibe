<script>
	import { base } from '$app/paths'
	import Discord from '~/icons/Discord.svelte'
	import Github from '~/icons/Github.svelte'
	import Logo from '~/icons/Logo.svelte'
import { i18n, supportedLanguages } from '~/lib/i18n'
const t = $i18n.t

const languages = Object.entries(supportedLanguages)
</script>

<div class="navbar bg-base-100 lg:flex lg:max-w-[1065px] mt-3 m-auto">
	<div class="flex-1">
		<a href={base} class="btn btn-ghost text-sm sm:btn-xs lg:btn-md lg:text-xl">
			<Logo />
			<span class="opacity-95">Vibe</span>
		</a>
	</div>
	<!-- links -->
       <ul class="flex-none menu menu-horizontal px-1 gap-4" dir="ltr">
               <li class="flex items-center">
                       <label class="sr-only">{t('language')}</label>
                       <select
                               class="select select-bordered select-sm"
                               on:change={(e) => i18n.changeLanguage(e.target.value)}
                               bind:value={$i18n.language}>
                               <option value="">{t('select-language')}</option>
                               {#each languages as [code, name]}
                                       <option value={code}>{name}</option>
                               {/each}
                       </select>
               </li>
               <a href={`https://github.com/thewh1teagle/vibe`} target="_blank">
                       <Github width="28" height="28" />
               </a>
       </ul>
</div>
