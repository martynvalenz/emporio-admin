<template>
    <div>
        <v-form>
            <v-row justify="center">
                <v-col cols="12" sm="12">
                    <v-select v-model="problem" outlined label="Tipo de soporte" :items="problems" item-value="type" item-text="problem" :error-messages="errors.problem"></v-select>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" sm="12">
                    <v-text-field v-model="subject" outlined label="Asunto" :error-messages="errors.subject"></v-text-field>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" sm="12">
                    <v-textarea v-model="msj" outlined label="Mensaje" :error-messages="errors.msj"></v-textarea>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" sm="12">
                    <v-btn class="success" block @click="send" :loading="loading">Enviar a Soporte <v-icon right>send</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-form>
        <v-snackbar
            v-model="snackbar"
            absolute
            :timeout="timeout"
            top
            right
            
            :color="snackColor"
            >
            {{ snackText }}
            <v-btn
                color="white"
                text
                @click="snackbar = false"
                >
                Cerrar
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script>
export default {
    props:['error'],
    data(){
        return{
            loading:false,
            problem:'',
            problems:[
                {type:0, problem:'Error'},
                {type:1, problem:'Mejora'},
                {type:2, problem:'Implementación'},
                {type:3, problem:'Duda'}
            ],
            subject:'',
            msj:'',
            path:'',
            errors:[],
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
            timeout: 6000,
        }
    },

    created(){
        this.setProblem();
        this.path = this.$route.path;
    },

    methods:{
        setProblem(){
            this.problem = this.error;
        },

        async send(){
            this.loading = true;
            await this.$axios.post('/api/ticket/send', {problem: this.problem, subject:this.subject, msj:this.msj, path:this.path})
            .then(res => {
                this.loading = false;
                this.errors = {};
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se envió el ticket a soporte';
                this.timeout = 2000;
                this.problem = '';
                this.subject = '';
                this.msj = '';
                if(this.error === 0){
                    setTimeout(function(){ location.reload(); }, 2100);
                }
                else{
                    setTimeout(function(){ this.$emit('closeSupport'); }, 2100);
                }
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.loading = false;
            })
        }
    }
}
</script>