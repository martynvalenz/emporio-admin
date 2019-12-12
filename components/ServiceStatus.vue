<template>
    <div>
        <v-dialog v-model="status_dialog" width="500">
			<v-card>
                <v-system-bar :color="color" dark height="60px;">
                    <h2 v-if=" service_status > 1">¿Deseas activar el servicio?</h2>
                    <h2 v-else>¿Deseas cancelar el servicio?</h2>
                    <v-spacer></v-spacer>
                    <v-btn icon small @click="status_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                </v-system-bar>
                <v-card-text>
                    <v-select v-if="service_status < 2" v-model="cancel_motiv" :items="motives" outlined label="Motivo de cancelación" item-value="status" item-text="text" :error-messages="errors.cancel_motiv"></v-select>
                    <v-textarea v-model="comment" outlined label="Comentarios (opcional)"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="status_dialog = false">Cerrar</v-btn>
                    <v-btn v-if="service_status > 1" class="success" :loading="loading" @click="Activate">Activar<v-icon right>check</v-icon></v-btn>
                    <v-btn v-else class="error" :loading="loading" @click="Cancel">Cancelar<v-icon right>block</v-icon></v-btn>
                </v-card-actions>
            </v-card>
		</v-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            service_status:0,
            service_id:'',
            color:0,
            status_dialog:false,
            loading:false,
            cancel_motiv:'',
            errors:{},
            motives:[
                {status:2, text:'Cancelar'},
                {status:3, text:'No Registro'},
                {status:4, text:'Repetido'},
            ],
            comment:'',
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    methods:{
        ServiceChangeStatus(id, color, status){
            this.status_dialog = true;
            this.service_id = id;
            this.color = color;
            this.service_status = status;
            this.clearData();
        },

        clearData(){
            this.cancel_motiv = '';
            this.comment = '';
            this.errors = {};
        },

        Cancel(){
            this.loading = true;
            this.$axios.put(`/api/service/cancel/${this.service_id}`, {cancel_motiv:this.cancel_motiv, comment:this.comment})
            .then(res => {
                this.$emit('updateService', res.data);
                this.clearData();
                this.loading = false;
                this.snackbar = true,
                this.snackColor = 'success',
                this.snackText = 'Se cambió el estatus del servicio',
                this.timeout = 2000,
                this.status_dialog = false;
            })
            .catch(error => {
                this.loading = false;
                this.errors = error.response.data.errors;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'No se pudo cambiar el estatus, revise los errores en el formulario';
                this.timeout = 2000;
            })
        },

        Activate(){
            this.loading = true;
            this.$axios.put(`/api/service/activate/${this.service_id}`, {comment:this.comment})
            .then(res => {
                this.$emit('updateService', res.data);
                this.clearData();
                this.loading = false;
                this.snackbar = true,
                this.snackColor = 'success',
                this.snackText = 'Se cambió el estatus del servicio',
                this.timeout = 2000,
                this.status_dialog = false;
            })
            .catch(error => {
                this.loading = false;
                this.errors = error.response.data.errors;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'No se pudo cambiar el estatus, revise los errores en el formulario';
                this.timeout = 2000;
            })
        }
    }
}
</script>