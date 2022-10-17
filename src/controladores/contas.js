const banco = require('../bancodedados')
let numeroProximaContaCriada = 1

function verificaDados(nome, cpf, data_nascimento, telefone, email, senha){
    if (!nome) {
        return "nome"
    }

    if (!cpf) {
        return "CPF"
    }

    if (!data_nascimento) {
        return "data de nascimento"
    }

    if (!telefone) {
        return "telefone"
    }

    if (!email) {
        return "e-mail"
    }

    if (!senha) {
        return "senha"
    }
}

function verificaCPFeEmail(cpf, email){
    const procuraCPF = banco.contas.find(item => item.usuario.cpf === cpf)
    const procuraEmail = banco.contas.find(item => item.usuario.email === email)

    return (procuraCPF || procuraEmail) ? true : false
}

function validaEmail(email){   
    const re = /\S+@\S+\.\S+/
    return re.test(email)
}

function verificaNumeroDaConta (numeroConta){
    const procuraNumeroConta = banco.contas.find(item => item.numero === Number(numeroConta))

    return (procuraNumeroConta) ? true : false
}

const listarContas = (req, res) => {
    const { senha_banco } = req.query

    if (!senha_banco) {
        return res.status(401).json({ mensagem: "É necessário informar a senha do banco!" })
    }
    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" })
    }
    return res.json(banco.contas)
}

const criarContas = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const resultadoDados = verificaDados(nome, cpf, data_nascimento, telefone, email, senha)
   
    if(resultadoDados){
        return res.status(400).json({ mensagem: `o campo ${verifica} deve ser informado` })
    }
    
    const resultadoCPFeEmail = verificaCPFeEmail (cpf, email)

    if (resultadoCPFeEmail){
        return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' })
    }

    if(!validaEmail(email)){
        return res.status(400).json({ mensagem: 'O e-mail informado não é válido!' })
    }

    const novaConta = {
        numero: numeroProximaContaCriada,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    banco.contas.push(novaConta)
    numeroProximaContaCriada++

    return res.status(201).send()
}

const atualizarUsuarioDaConta = (req, res) => {
    const { numeroConta } = req.params
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    const index = numeroConta -1

    if(!verificaNumeroDaConta(numeroConta)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta solicitada' })
    }

    const resultadoDados = verificaDados(nome, cpf, data_nascimento, telefone, email, senha)

    if(resultadoDados){
        return res.status(400).json({ mensagem: `o campo ${resultadoDados} deve ser informado` })
    }

    const resultadoCPFeEmail = verificaCPFeEmail (cpf, email)

    if (resultadoCPFeEmail){
        return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' })
    }

    if(!validaEmail(email)){
        return res.status(400).json({ mensagem: 'O e-mail informado não é válido!' })
    }
    
    banco.contas[index].usuario.nome = nome
    banco.contas[index].usuario.cpf = cpf
    banco.contas[index].usuario.data_nascimento = data_nascimento
    banco.contas[index].usuario.telefone = telefone
    banco.contas[index].usuario.email = email
    banco.contas[index].usuario.senha = senha

    return res.status(204).send()
}

const excluirContas = (req, res) => {
    const { numeroConta } = req.params
    const index = numeroConta -1

    if(!verificaNumeroDaConta(numeroConta)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta solicitada' })
    }

    if (banco.contas[index].saldo !== 0){
        return res.status(404).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' })
    }

    banco.contas.splice(index, 1)
    return res.status(204).send()
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query
    const index = numero_conta - 1

    if (!senha) {
        return res.status(401).json({ mensagem: "É necessário informar a senha da conta!" })
    }

    if (!numero_conta) {
        return res.status(401).json({ mensagem: "É necessário informar o número da conta!" })
    }

    if(!verificaNumeroDaConta(numero_conta)){
        return res.status(404).json({ mensagem: 'conta bancária não encontada!' })
    }

    if (senha !== banco.contas[index].usuario.senha) {
        return res.status(401).json({ mensagem: "A senha informada é inválida!" })
    }

    const deposito = banco.depositos.filter(item => item.numero_conta === numero_conta)
    const saque = banco.saques.filter(item => item.numero_conta === numero_conta)
    const transfEnv = banco.transferencias.filter(item => item.numero_conta_origem === numero_conta)
    const transfRec = banco.transferencias.filter(item => item.numero_conta_destino === numero_conta)
    
    return res.status(200).json(
        {
            depositos: deposito,
            saques: saque,
            transferenciasEnviadas: transfEnv,
            transferenciasRecebidas: transfRec
        }
    )
}

module.exports = {
    listarContas,
    criarContas,
    atualizarUsuarioDaConta,
    excluirContas,
    extrato
}