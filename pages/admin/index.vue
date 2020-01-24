<template>
    <div >
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <img src="/images/logos/logo-full.png" style="max-height:113px; width:auto;" />
            </v-layout>
        </v-container>
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
