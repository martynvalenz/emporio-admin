<template>
    <div>
        {{user}}
    </div>
</template>

<script>
export default {
    layout: 'admin',
    middleware: 'auth',
    head:{
        title: 'Dashboard'
    },
}
</script>

<style>

</style>
