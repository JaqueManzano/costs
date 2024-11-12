import { parse, v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loading from '../layout/Loading';
import Container from '../layout/Container';
import React from 'react';
import styles from '../project/Project.module.css'
import ProjectForm from '../project/ProjectForm'
import Message from '../layout/Message'
import ServiceForm from '../service/ServiceForm'

function Project() {
    const { id } = useParams();
    const [project, setProject] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [message, setMessage] = useState()
    const [type, setType] = useState()

    useEffect(() => {
        setTimeout(() => {
            fetch(`http://localhost:5000/projects/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((resp) => resp.json())
                .then((data) => {
                    setProject(data);
                })
                .catch((error) => console.log(error));
        }, 300);
    }, [id]);

    function createService(project){
        setMessage('')
        const lastService = project.services[project.services.length - 1]
        lastService.id = uuidv4();
        
        const lastServiceCost = lastService.cost;
        const newCost = parseFloat(project.cost) + parseFloat(lastService.cost)

        if(newCost > parseFloat(project.budget))
        {
            setMessage('Orçamento ultrapassado, verifique o valor do serviço.')
            setType('error')
            project.services.pop()
            return false;
        }

        project.cost = newCost;

        fetch(`http://localhost:5000/projects/${project.id}`,{
            method: 'PATCH',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify(project)
        })
        .then((resp) => resp.json())
        .then((data) => {
            setProject(data)
        })
        .catch(error => console.log(error))
    }
    
    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm);
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm);
    }

    function editPost(project){
        setMessage(null);
        setType(null);
        
        if(project.budget < project.cost){
            setMessage("O orçamento não pode ser menor que o custo do projeto!")
            setType('error')
            return false;
        }

        fetch(`http://localhost:5000/projects/${project.id}`,{
            method: 'PATCH',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })
        .then(resp => resp.json())
        .then((data) =>{
            setProject(data)
            setShowProjectForm(!showProjectForm)
            setMessage("Projeto atualizado com sucesso!")
            setType('success')
        })
        .catch(error => console.log(error))
    }
    return (
        <>
            {project.name ? (
                <div className={styles.project_details}>
                    {message && <Message type={type} message={message} />}
                    <Container customClass="column">
                        <div className={styles.details_container}>
                            <h1>Projeto: {project.name}</h1>
                            <button className={styles.btn} onClick={toggleProjectForm}>
                                {!showProjectForm ? 'Editar projeto' : 'Fechar'}
                            </button>
                            {!showProjectForm ? (
                                <div className={styles.project_info}>
                                    <p>
                                        <span>Categoria: </span>
                                        {project.category.name}
                                    </p>
                                    <p>
                                        <span>Total de Orçamento:</span> R$ {project.budget}
                                    </p>
                                    <p>
                                        <span>Total Utilizado:</span> R$ {project.cost}
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.project_info}>
                                    <ProjectForm handleSubmit={editPost}
                                    btnText="Concluir Edição"
                                    projectData={project}/>
                                </div>
                            )}
                        </div>
                        <div className={styles.service_form_container}>
                            <h2>Adicione um serviço:</h2>
                            <button className={styles.btn} onClick={toggleServiceForm}>
                                {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                            </button>         
                            <div className={styles.project_info}>
                                {showServiceForm && (
                                    <ServiceForm
                                    handleSubmit={createService}
                                    btnText='Adicionar serviço'
                                    projectData={project}/>
                                )}
                            </div>               
                        </div>
                        <h2>Serviços</h2>
                        <Container customClass="start">
                                <p>Itens de Serviços</p>
                        </Container>
                    </Container>
                </div>
            ) : (
                <Loading />
            )}
        </>
    );
}

export default Project;
