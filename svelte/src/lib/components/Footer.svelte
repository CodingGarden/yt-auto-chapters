<script lang="ts">
	import BrandLogo from './BrandLogo.svelte';
	import Icon from '@iconify/svelte';
</script>

<footer class="bg-white" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="sr-only">Footer</h2>
	<div class="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<div class="space-y-8">
				<div class="flex flex-row gap-6 items-center">
					<BrandLogo />
					<p class="text-sm sm:text-lg leading-6 text-gray-600 font-semibold">
						Chapterize. Automatically add chapters to your YouTube videos.
					</p>
				</div>
				<!-- Socials -->
				<div class="mx-4 flex gap-4">
					<!-- YouTube -->
					<a
						href="https://www.youtube.com/@CodingGardenArchive"
						class="text-gray-400 hover:text-gray-500"
					>
						<span class="sr-only">YouTube</span>
						<div class="h-6 w-6">
							<Icon icon="mdi:youtube" />
						</div>
					</a>
					<!-- GitHub -->
					<a
						href="https://github.com/CodingGarden/yt-auto-chapters"
						class="text-gray-400 hover:text-gray-500"
					>
						<span class="sr-only">GitHub</span>
						<div class="h-6 w-6">
							<Icon icon="mdi:github" />
						</div>
					</a>
				</div>
			</div>
		</div>
		<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
			<div class="md:grid md:grid-cols-2 md:gap-8">
				<div>
					<h3 class="text-sm font-semibold leading-6 text-gray-900">Contibutors</h3>
					<ul role="list" class="mt-6 space-y-4">
						<li>
							<a href="#" class="text-sm leading-6 text-gray-600 hover:text-gray-900">CJ</a>
						</li>
						<li>
							<a href="#" class="text-sm leading-6 text-gray-600 hover:text-gray-900">Ryan Roga</a>
						</li>
					</ul>
				</div>
				<div class="mt-10 md:mt-0">
					<h3 class="text-sm font-semibold leading-6 text-gray-900">GitHub</h3>
					<ul role="list" class="mt-6 space-y-4">
						<li>
							<a href="#" class="text-sm leading-6 text-gray-600 hover:text-gray-900"
								>Project Repo</a
							>
						</li>
						<li>
							<a href="#" class="text-sm leading-6 text-gray-600 hover:text-gray-900">CJ</a>
						</li>
						<li>
							<a href="#" class="text-sm leading-6 text-gray-600 hover:text-gray-900">Ryan Roga</a>
						</li>
					</ul>
				</div>
			</div>
			<div class="md:grid md:grid-cols-2 md:gap-8">
				<div>
					<h3 class="text-sm font-semibold leading-6 text-gray-900">Project</h3>
					<ul role="list" class="mt-6 space-y-4">
						<li>
							<a href="/about" class="text-sm leading-6 text-gray-600 hover:text-gray-900">About</a>
						</li>
						<li>
							<a href="/faq" class="text-sm leading-6 text-gray-600 hover:text-gray-900">FAQ</a>
						</li>
						<li>
							<a href="/contribute" class="text-sm leading-6 text-gray-600 hover:text-gray-900"
								>Contribute</a
							>
						</li>
					</ul>
				</div>
				<div class="mt-10 md:mt-0">
					<h3 class="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
					<ul role="list" class="mt-6 space-y-4">
						<li>
							<a href="/privacy" class="text-sm leading-6 text-gray-600 hover:text-gray-900"
								>Privacy Policy</a
							>
						</li>
						<li>
							<a href="/terms" class="text-sm leading-6 text-gray-600 hover:text-gray-900"
								>Terms of Service</a
							>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="mt-2 border-t border-gray-900/10 pt-4 sm:mt-4 lg:mt-6">
		<p class="text-xs leading-5 text-gray-500 p-4">
			&copy; 2023 Ryan Paranich, Inc. All rights reserved.
		</p>
	</div>
</footer>
