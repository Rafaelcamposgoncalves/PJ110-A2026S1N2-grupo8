<?php
class Configuracaoquilha {
    private $conn;
    private $table = "configuracaoquilha";

    public function __construct($db) { $this->conn = $db; }

    public function listar($apenasAtivos = false) {
        $sql = "SELECT id_configuracaoquilha, descricao, ativo FROM {$this->table} ";
        if ($apenasAtivos) $sql .= " WHERE ativo = 1 ";
        $sql .= " ORDER BY descricao ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscar($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id_configuracaoquilha = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function criar($desc) {
        $sql = "INSERT INTO {$this->table} (descricao, ativo) VALUES (:desc, 1)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':desc', $desc);
        return $stmt->execute();
    }

    public function atualizar($id, $desc) {
        $sql = "UPDATE {$this->table} SET descricao = :desc WHERE id_configuracaoquilha = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':desc', $desc);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function atualizarAtivo($id, $ativo) {
        $sql = "UPDATE {$this->table} SET ativo = :ativo WHERE id_configuracaoquilha = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deletar($id) {
        $sql = "DELETE FROM {$this->table} WHERE id_configuracaoquilha = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
