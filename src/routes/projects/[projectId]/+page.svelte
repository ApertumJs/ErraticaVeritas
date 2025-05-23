<script lang="ts">
	import Event from '$lib/components/Event.svelte';
	import Label from '$lib/components/Label.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { cn } from '$lib/utils.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { dateProxy, superForm } from 'sveltekit-superforms';

	dayjs.extend(relativeTime);

	let { data } = $props();

	let editModal: HTMLDialogElement;

	const {
		form: prjEditForm,
		enhance: prjEditEnhance,
		constraints: prjEditConstraints,
		delayed: prjEditDelayed,
		errors
	} = superForm(data.projectEditForm, {
		onResult: ({ result }) => {
			if (result.type === 'success') editModal.close();
		},
		invalidateAll: true
	});

	const {
		form: deleteForm,
		enhance: deleteEnhance,
		delayed: deleteDelayed
	} = superForm(data.projectDeleteForm, {
		invalidateAll: true
	});

	const dateInput = dateProxy(prjEditForm, 'deadline', { format: 'date' });

	let deleteConfirmation = $state('');

	const { events } = $derived(data.project);

	const completedEvents = $derived(events.filter((e) => e.completed));
</script>

<svelte:head>
	<title>Project - {data.project.name}</title>
</svelte:head>

<div class="mx-auto w-full md:max-w-2xl">
	<section class="text-center">
		<h1 class="mb-12 text-4xl font-bold md:text-6xl">{data.project.name}</h1>
	</section>
	<div class="flex flex-col">
		<div class="flex max-md:flex-col max-md:gap-4 md:justify-between">
			<div>
				<h1 class="heading-sub text-muted mb-8">Project details</h1>
				<ul>
					<li>
						<span class="font-medium">Deadline:</span>
						<span class="text-muted"
							>{#if data.project.deadline}
								{dayjs().to(dayjs(data.project.deadline))} ({dayjs(data.project.deadline).format(
									'D MMMM YYYY'
								)})
							{:else}
								No deadline
							{/if}
						</span>
					</li>
					<li>
						<span class="font-medium">Status:</span>
						<span
							class={cn(
								data.project.status === 'active'
									? 'text-success'
									: data.project.status === 'archived'
										? 'text-secondary'
										: 'text-muted'
							)}>{data.project.status}</span
						>
					</li>
				</ul>
			</div>
			<div>
				<button class="btn btn-primary my-auto" onclick={() => editModal.showModal()}
					>Edit Project</button
				>
			</div>
		</div>
		<div>
			{#if events.length != 0}
				<section class="mt-4 flex flex-col items-center gap-4">
					<h3 class="heading-muted mb-4">Due events ({events.length})</h3>
					{#each events as event (event.id)}
						<Event
							{event}
							projects={data.userProjects}
							editFormData={data.editForm}
							toggleFormData={data.toggleForm}
						/>
					{/each}
				</section>
			{/if}
			{#if completedEvents.length != 0}
				<section class="mt-4 flex flex-col items-center gap-4">
					<h3 class="heading-small mb-4 text-success">
						Completed events ({completedEvents.length})
					</h3>
					{#each completedEvents as event (event.id)}
						<Event
							{event}
							projects={data.userProjects}
							editFormData={data.editForm}
							toggleFormData={data.toggleForm}
						/>
					{/each}
				</section>
			{/if}
			{#if completedEvents.length === 0 && events.length === 0}
				<h2 class="heading-small mt-8 text-center italic">No events in this project</h2>
			{/if}
		</div>
	</div>
</div>

<dialog bind:this={editModal} class="modal">
	<div class="modal-box">
		<h1 class="heading-main mb-4">Edit Project</h1>
		<form action="?/edit" method="post" class="flex flex-col gap-4" use:prjEditEnhance>
			<div class="flex flex-col">
				<Label forAttr="name">Name</Label>
				<input
					type="text"
					class="input input-primary"
					name="name"
					{...$prjEditConstraints.name}
					bind:value={$prjEditForm.name}
				/>
				{#if $errors.name}
					<span class="mt-2 text-error">{$errors.name.join(', ')}</span>
				{/if}
			</div>
			<div class="flex flex-col">
				<Label forAttr="deadline">Deadline</Label>
				<input
					type="date"
					class="input input-primary"
					name="deadline"
					{...$prjEditConstraints.deadline}
					bind:value={$dateInput}
				/>
				{#if $errors.deadline}
					<span class="mt-2 text-error">{$errors.deadline.join(', ')}</span>
				{/if}
			</div>
			<input type="hidden" name="projectId" bind:value={$prjEditForm.projectId} />
			<button disabled={!$prjEditForm.deadline && !$prjEditForm.name} class="btn btn-primary"
				>Edit {#if $prjEditDelayed}
					<Spinner />
				{/if}</button
			>
		</form>
		<h1 class="heading-main my-4 border-t border-base-content/40 pt-4 text-error">
			Delete project?
		</h1>
		<form action="?/delete" class="mt-4" use:deleteEnhance method="post">
			<input type="hidden" name="projectId" bind:value={$deleteForm.projectId} />
			<div class="flex flex-col">
				<Label forAttr="confirmation"
					>Type <span class="font-medium text-base-content">delete my project</span> below</Label
				>
				<input
					id="confirmation"
					type="text"
					bind:value={deleteConfirmation}
					class="input input-error"
				/>
				<button disabled={deleteConfirmation != 'delete my project'} class="btn btn-error mt-4"
					>Delete {#if $deleteDelayed}
						<Spinner />
					{/if}</button
				>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
