import "dotenv/config"
import express, { request, response } from "express"
import mysql from "mysql2"
import { v4 as uuidv4 } from "uuid"

const PORT = 3333

const app = express()

//receber dados no formato JSON
app.use(express.json())

//CRIAR conexão com o banco de dados
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sen@iDev77!.",
    database: "livraria3F",
    port: 3306
})

//CONECTAR ao Banco
conn.connect((err) => {
    if (err) {
        console.error(err)
    }
    console.log("MYSQL conectado!");
    app.listen(PORT, () => {
        console.log("servidor on PORT " + PORT)
    })
})

app.get('/livros', (request, response) => {

    const sql = /* sql */ `SELECT * FROM livros`
    conn.query(sql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar livros" })
            return
        }
        const livros = data
        response.status(200).json(livros)
    })
})

app.post("/livros", (request, response) => {
    const { titulo, autor, ano_publicacao, genero, preco } = request.body

    //validações
    if (!titulo) {
        response.status(400).json({ err: "O livro é obrigatório" })
        return
    }
    if (!autor) {
        response.status(400).json({ err: "O autor é obrigatório" })
        return
    }
    if (!ano_publicacao) {
        response.status(400).json({ err: "O ano publicação é obrigatório" })
        return
    }
    if (!genero) {
        response.status(400).json({ err: "O genêro é obrigatório" })
        return
    }
    if (!preco) {
        response.status(400).json({ err: "O preço é obrigatório" })
        return
    }

    //verificar se o livro não foi cadastrado
    const checkSql = /*sql*/ `SELECT * FROM livros WHERE titulo = "${titulo}" AND autor = "${autor}" AND ano_publicacao = "${ano_publicacao}"  `
    conn.query(checkSql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar livros" })
            return
        }

        if(data.length > 0){
            response.status(409).json({err: "Livro já foi cadastrado"})
        }

        //Cadastrar o livro
        const id = uuidv4()
        const disponibilidade = 1
        const insertSql = /*sql*/ `INSERT INTO livros
        (livro_id, titulo, autor, ano_publicacao, genero, preco, disponibilidade)
        VALUES
        ("${id}","${titulo}","${autor}","${ano_publicacao}","${genero}","${preco}","${disponibilidade}")`
        conn.query(insertSql, (err)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao cadastrar"})
                return
            }
            response.status(201).json({message:"Livro Cadastrado"})
        })

    })
})

