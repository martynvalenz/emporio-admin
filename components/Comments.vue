<template>
    <div>
        <v-dialog v-model="comments_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
            <v-card>
                <v-system-bar color="primary" dark height="60px;">
                    <h2>Comentarios</h2>
                    <v-spacer></v-spacer>
                    <v-btn icon small @click="comments_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                </v-system-bar>
                <v-card-text>
                    <v-container>
                        <v-timeline dense clipped>
                            <v-timeline-item color="primary">
                                <template v-slot:icon>
                                    <v-icon class="white--text">add</v-icon>
                                </template>
                                <v-card class="elevation-3">
                                    <v-card-text>
                                        <v-textarea v-model="comment" hide-details flat label="Crear comentario..." outlined :error-messages="errors.comment"></v-textarea>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn color="primary" :loading="loading" @click="Comment">Agregar comentario</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-timeline-item>
                            <v-timeline-item v-for="(comment, index) in comments" :key="index" color="primary" large>
                                <template v-slot:icon>
                                    <v-avatar>
                                        <!-- <img src="http://i.pravatar.cc/64"> -->
                                        <span class="white--text headline">{{comment.initials}}</span>
                                    </v-avatar>
                                </template>
                                <v-card class="elevation-3">
                                    <v-card-title>{{comment.name}} {{comment.last_name}}</v-card-title>
                                    <v-card-text style="font-size:16px;">{{comment.comment}} <br><small>{{comment.created_at}}</small></v-card-text>
                                    <!-- <v-card-actions v-if="comment.user_id == user.user.id">
                                        <v-btn color="warning">Editar</v-btn>
                                        <v-btn color="error">Eliminar</v-btn>
                                    </v-card-actions> -->
                                </v-card>
                            </v-timeline-item>
                        </v-timeline>
                    </v-container>
                </v-card-text>
                <v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
                    <v-btn @click="getComments"><v-icon>sync</v-icon></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text @click="service_dialog = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            comments_dialog:false,
            loading:false,
            comments:[],
            comment:'',
            services_control_id:'',
            binnacle_status_id:'',
            errors:[],
            id:'',
            type:'',//service, status
        }
    },

    methods:{
        showComments(id, binnacle_status_id, type){
            this.comments_dialog = true;
            this.clearData();
            this.services_control_id = id;
            this.binnacle_status_id = binnacle_status_id;
            this.type = type;
            this.getComments();
        },

        getComments(){
            if(this.type == 'service'){
                this.$axios.get(`/api/comments/services/${this.services_control_id}`)
                .then(res => {
                    this.comments = res.data;
                })
            }
            else if(this.type == 'status'){
                this.$axios.get(`/api/comments/status/${this.binnacle_status_id}`)
                .then(res => {
                    this.comments = res.data;
                })
            }
        },

        clearData(){
            this.id = '';
            this.comment = '';
            this.errors = {};
        },

        async Comment(){
            this.loading = true;
            await this.$axios.post('/api/comment/store', {comment:this.comment, services_control_id:this.services_control_id, binnacle_status_id:this.binnacle_status_id})
            .then(res => {
                this.comments.unshift(res.data);
                this.clearData();
                this.loading = false;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.loading = false;
            })
        }
    }
}
</script>